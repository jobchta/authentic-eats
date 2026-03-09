/**
 * tileCache.ts
 * -----------
 * Pure utility layer for the tile-based cache architecture.
 * No React imports — fully unit-testable.
 *
 * Responsibilities:
 *  - Build canonical tile keys from city names
 *  - Determine if a cached tile is still fresh
 *  - Merge curated (Supabase) and live (OSM / tile-cache) restaurant arrays
 *  - Deduplicate by osm_id or normalised name+city fingerprint
 *  - Sort merged results (curated first, then by rating)
 */

import { supabase } from '@/integrations/supabase/client';
import type { DbRestaurant } from '@/hooks/use-restaurants';
import type { OsmRestaurant } from '@/hooks/use-osm-restaurants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AreaTile {
  id: string;
  tile_key: string;
  city: string;
  country_code: string;
  continent: string;
  bbox: { north: number; south: number; east: number; west: number } | null;
  geohash: string | null;
  record_count: number;
  last_fetched_at: string | null;
  next_refresh_at: string | null;
  status: 'pending' | 'fetching' | 'ready' | 'error';
  source: 'osm' | 'manual' | 'import';
}

export interface TileRestaurantsCache {
  id: string;
  tile_id: string;
  payload: OsmRestaurant[];
  total_count: number;
  source_version: string | null;
  cached_at: string;
  expires_at: string;
  is_stale: boolean;
}

export type UnifiedRestaurant = (
  | (DbRestaurant & { _source: 'curated' })
  | (OsmRestaurant & { _source: 'tile' | 'live' })
);

export interface TileLookupResult {
  restaurants: UnifiedRestaurant[];
  source: 'curated' | 'tile_cache' | 'live' | 'merged';
  cacheHit: boolean;
  tileId: string | null;
  totalCount: number;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default cache TTL in days */
export const TILE_TTL_DAYS = 7;

/** Minimum city string length to attempt a tile lookup */
export const MIN_CITY_LENGTH = 2;

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

/**
 * Build a canonical tile key from city + country code.
 * e.g. canonicaliseTileKey('Mumbai ', 'IN') => 'IN-mumbai'
 */
export function canonicaliseTileKey(city: string, countryCode = 'XX'): string {
  const normCity = city.trim().toLowerCase().replace(/\s+/g, '-');
  return `${countryCode.toUpperCase()}-${normCity}`;
}

/**
 * Returns true if the tile cache entry is still fresh.
 */
export function isTileFresh(cache: Pick<TileRestaurantsCache, 'expires_at' | 'is_stale'>): boolean {
  if (cache.is_stale) return false;
  return new Date(cache.expires_at) > new Date();
}

// ---------------------------------------------------------------------------
// Fingerprinting for deduplication
// ---------------------------------------------------------------------------

/**
 * Returns a normalised string fingerprint for an OSM restaurant.
 * Used to detect duplicates when merging sources.
 */
function osmFingerprint(r: OsmRestaurant): string {
  return `osm:${r.osm_id}`;
}

/**
 * Returns a normalised string fingerprint for a curated DB restaurant.
 */
function dbFingerprint(r: DbRestaurant): string {
  return `db:${r.id}`;
}

/**
 * Name+city fingerprint used as a fallback when OSM IDs are unavailable.
 */
function nameCityFingerprint(name: string, city: string): string {
  return `nc:${name.toLowerCase().trim()}|${city.toLowerCase().trim()}`;
}

// ---------------------------------------------------------------------------
// Merge logic
// ---------------------------------------------------------------------------

/**
 * Merge curated (DbRestaurant[]) and live/cached (OsmRestaurant[]) arrays.
 *
 * Rules:
 *  1. Curated rows always win on duplicates (they have richer metadata).
 *  2. OSM rows not already represented by a curated entry are appended.
 *  3. Result is sorted: curated first (by rating DESC), then live (by name).
 */
export function mergeRestaurantResults(
  curated: DbRestaurant[],
  live: OsmRestaurant[],
  liveSource: 'tile' | 'live' = 'live'
): UnifiedRestaurant[] {
  const seen = new Set<string>();

  // Tag and track curated entries
  const curatedTagged: UnifiedRestaurant[] = curated.map((r) => {
    seen.add(dbFingerprint(r));
    seen.add(nameCityFingerprint(r.name, r.city));
    return { ...r, _source: 'curated' as const };
  });

  // Add live entries that aren't duplicates
  const liveFiltered: UnifiedRestaurant[] = [];
  for (const r of live) {
    const fp = osmFingerprint(r);
    const ncFp = nameCityFingerprint(r.name, r.city);
    if (!seen.has(fp) && !seen.has(ncFp)) {
      seen.add(fp);
      seen.add(ncFp);
      liveFiltered.push({ ...r, _source: liveSource });
    }
  }

  // Sort: curated (rating DESC) then live (name ASC)
  const sortedCurated = curatedTagged.sort(
    (a, b) => ((b as DbRestaurant).rating ?? 0) - ((a as DbRestaurant).rating ?? 0)
  );

  const sortedLive = liveFiltered.sort((a, b) =>
    (a as OsmRestaurant).name.localeCompare((b as OsmRestaurant).name)
  );

  return [...sortedCurated, ...sortedLive];
}

// ---------------------------------------------------------------------------
// Supabase tile-cache read helpers
// ---------------------------------------------------------------------------

/**
 * Look up a tile by its canonical key.
 * Returns null if not found.
 */
export async function getTileByKey(tileKey: string): Promise<AreaTile | null> {
  const { data, error } = await supabase
    .from('area_tiles')
    .select('*')
    .eq('tile_key', tileKey)
    .maybeSingle();

  if (error) {
    console.warn('[tileCache] getTileByKey error:', error.message);
    return null;
  }
  return data as AreaTile | null;
}

/**
 * Fetch the cached payload for a tile.
 * Returns null if not found or stale.
 */
export async function getFreshTileCache(
  tileId: string
): Promise<TileRestaurantsCache | null> {
  const { data, error } = await supabase
    .from('tile_restaurants_cache')
    .select('*')
    .eq('tile_id', tileId)
    .eq('is_stale', false)
    .maybeSingle();

  if (error) {
    console.warn('[tileCache] getFreshTileCache error:', error.message);
    return null;
  }
  return data as TileRestaurantsCache | null;
}

/**
 * Record a search request for observability.
 * Fire-and-forget; errors are swallowed so they never block the UI.
 */
export async function recordSearchRequest(opts: {
  queryNormalized: string;
  tileIds?: string[];
  cacheHit: boolean;
  source: 'supabase' | 'osm' | 'tile_cache' | 'merged';
  resultCount?: number;
  latencyMs?: number;
  sessionId?: string;
}): Promise<void> {
  try {
    await supabase.from('search_requests').insert({
      query_normalized: opts.queryNormalized,
      tile_ids: opts.tileIds ?? [],
      cache_hit: opts.cacheHit,
      source: opts.source,
      result_count: opts.resultCount ?? null,
      latency_ms: opts.latencyMs ?? null,
      session_id: opts.sessionId ?? null,
    });
  } catch {
    // observability must never break the app
  }
}
