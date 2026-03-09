/**
 * restaurantRepository.ts
 * -----------------------
 * Single data-access facade for all restaurant reads.
 * All pages and hooks should import from here instead of
 * calling Supabase / OSM directly.
 *
 * Priority order for any city-scoped query:
 *   1. tile_restaurants_cache  (fastest, 7-day TTL, zero extra cost)
 *   2. osm-restaurants edge function  (live OSM, cached to tile on success)
 *   3. Supabase restaurants table  (curated, always merged on top)
 *
 * For global / non-city queries we fall back to the curated table only.
 */

import { supabase } from '@/integrations/supabase/client';
import type { DbRestaurant } from '@/hooks/use-restaurants';
import type { OsmRestaurant } from '@/hooks/use-osm-restaurants';
import {
  canonicaliseTileKey,
  getTileByKey,
  getFreshTileCache,
  mergeRestaurantResults,
  recordSearchRequest,
  MIN_CITY_LENGTH,
  type TileLookupResult,
  type UnifiedRestaurant,
} from './tileCache';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface RestaurantFilters {
  city?: string;
  countryCode?: string;     // ISO 3166-1 alpha-2, e.g. 'IN'
  continent?: string;
  tier?: string;
  price?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Fetch curated restaurants from Supabase with filters applied. */
async function fetchCurated(
  filters: RestaurantFilters
): Promise<DbRestaurant[]> {
  let query = supabase
    .from('restaurants')
    .select('*, country:countries(*)')
    .order('rating', { ascending: false });

  if (filters.city) {
    query = query.ilike('city', `%${filters.city.trim()}%`);
  }
  if (filters.tier && filters.tier !== 'All') {
    query = query.eq('tier', filters.tier);
  }
  if (filters.price && filters.price !== 'All') {
    query = query.eq('price_range', filters.price);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit ?? 24) - 1
    );
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[restaurantRepository] fetchCurated error:', error.message);
    return [];
  }

  let results = (data as unknown as DbRestaurant[]) ?? [];

  // Client-side filters for joined fields
  if (filters.continent && filters.continent !== 'All') {
    results = results.filter(
      (r) => r.country?.continent === filters.continent
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine_type.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country?.name?.toLowerCase().includes(q) ||
        r.speciality?.toLowerCase().includes(q)
    );
  }

  return results;
}

/** Fetch live OSM restaurants via the Supabase edge function. */
async function fetchLiveOsm(
  city: string,
  limit = 50
): Promise<OsmRestaurant[]> {
  const { data, error } = await supabase.functions.invoke('osm-restaurants', {
    body: { city, limit },
  });
  if (error) {
    console.warn('[restaurantRepository] fetchLiveOsm error:', error.message);
    return [];
  }
  return (data?.results as OsmRestaurant[]) ?? [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Primary entry point for city-scoped restaurant discovery.
 *
 * Strategy:
 *  1. Try the tile cache  →  instant, zero cost
 *  2. If stale/missing, call OSM edge function  →  live data
 *  3. Always merge curated rows on top
 *  4. Record the search request for analytics
 */
export async function getCityRestaurants(
  city: string,
  filters: Omit<RestaurantFilters, 'city'> = {},
  opts: { sessionId?: string; countryCode?: string } = {}
): Promise<TileLookupResult> {
  const t0 = performance.now();
  const tileKey = canonicaliseTileKey(city, opts.countryCode ?? 'XX');
  let cacheHit = false;
  let tileId: string | null = null;
  let liveRestaurants: OsmRestaurant[] = [];
  let source: TileLookupResult['source'] = 'supabase';

  if (city.length >= MIN_CITY_LENGTH) {
    // 1. Check tile manifest
    const tile = await getTileByKey(tileKey);
    if (tile) {
      tileId = tile.id;
      // 2. Check cache payload
      const cached = await getFreshTileCache(tile.id);
      if (cached) {
        liveRestaurants = cached.payload;
        cacheHit = true;
        source = 'tile_cache';
      }
    }

    // 3. If no fresh cache, hit OSM live
    if (!cacheHit) {
      liveRestaurants = await fetchLiveOsm(city, 100);
      source = liveRestaurants.length > 0 ? 'live' : 'supabase';
    }
  }

  // 4. Always fetch curated and merge
  const curated = await fetchCurated({ ...filters, city });
  const merged = mergeRestaurantResults(
    curated,
    liveRestaurants,
    cacheHit ? 'tile' : 'live'
  );

  if (curated.length > 0 && liveRestaurants.length > 0) source = 'merged';

  const latencyMs = Math.round(performance.now() - t0);

  // 5. Fire-and-forget analytics
  void recordSearchRequest({
    queryNormalized: city.toLowerCase().trim(),
    tileIds: tileId ? [tileId] : [],
    cacheHit,
    source,
    resultCount: merged.length,
    latencyMs,
    sessionId: opts.sessionId,
  });

  return {
    restaurants: merged,
    source,
    cacheHit,
    tileId,
    totalCount: merged.length,
    latencyMs,
  };
}

/**
 * Global (non-city) query — hits Supabase curated table only.
 * Used for the main /explore page.
 */
export async function getGlobalRestaurants(
  filters: RestaurantFilters = {}
): Promise<{ restaurants: UnifiedRestaurant[]; total: number }> {
  const curated = await fetchCurated(filters);
  const tagged = curated.map((r) => ({ ...r, _source: 'curated' as const }));
  return { restaurants: tagged, total: tagged.length };
}

/**
 * Fetch a single restaurant by ID from the curated table.
 */
export async function getRestaurantById(
  id: string
): Promise<DbRestaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, country:countries(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('[restaurantRepository] getRestaurantById error:', error.message);
    return null;
  }
  return data as unknown as DbRestaurant | null;
}

/**
 * Fetch featured restaurants for the homepage hero.
 */
export async function getFeaturedRestaurants(
  limit = 16
): Promise<DbRestaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, country:countries(*)')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[restaurantRepository] getFeaturedRestaurants error:', error.message);
    return [];
  }
  return data as unknown as DbRestaurant[];
}

/**
 * Aggregate stats for the homepage counter display.
 */
export async function getRestaurantStats(): Promise<{
  total: number;
  tiers: Record<string, number>;
  continents: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('tier, country:countries(continent)');

  if (error || !data) return { total: 0, tiers: {}, continents: {} };

  const tiers: Record<string, number> = {};
  const continents: Record<string, number> = {};
  for (const r of data as any[]) {
    tiers[r.tier] = (tiers[r.tier] || 0) + 1;
    const c = r.country?.continent || 'Other';
    continents[c] = (continents[c] || 0) + 1;
  }
  return { total: data.length, tiers, continents };
}
