/**
 * citySeeder.ts
 * Programmatic helper to upsert area_tiles rows for a given city bbox.
 * Used by the GitHub Actions crawler and can be called from admin UI.
 *
 * Zero-dependency on browser APIs — safe to run in Node or edge runtime.
 */

import { createClient } from '@supabase/supabase-js';

export interface CityConfig {
  name: string;
  zoom: number;
  /** bounding box in WGS84 */
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

/** Convert lat/lon to slippy-map tile XY at a given zoom. */
export function latLonToTile(
  lat: number,
  lon: number,
  zoom: number
): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      n
  );
  return { x, y };
}

/** Return all tile XY pairs that cover a bounding box at a given zoom. */
export function bboxToTiles(
  bbox: CityConfig['bbox'],
  zoom: number
): Array<{ x: number; y: number }> {
  const topLeft = latLonToTile(bbox.maxLat, bbox.minLon, zoom);
  const bottomRight = latLonToTile(bbox.minLat, bbox.maxLon, zoom);
  const tiles: Array<{ x: number; y: number }> = [];
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

/**
 * Upsert all tiles for a city into area_tiles.
 * Returns the count of rows inserted/updated.
 */
export async function seedCity(
  supabaseUrl: string,
  supabaseServiceKey: string,
  city: CityConfig
): Promise<{ inserted: number; error: string | null }> {
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const tiles = bboxToTiles(city.bbox, city.zoom);

  if (tiles.length === 0) {
    return { inserted: 0, error: 'No tiles generated for bbox' };
  }

  const rows = tiles.map(({ x, y }) => ({
    zoom: city.zoom,
    x,
    y,
    status: 'pending' as const,
  }));

  // Batch in groups of 500 to stay within Supabase row limits per request
  const BATCH = 500;
  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error, count } = await client
      .from('area_tiles')
      .upsert(batch, { onConflict: 'zoom,x,y', count: 'exact' });
    if (error) {
      return { inserted: totalInserted, error: error.message };
    }
    totalInserted += count ?? batch.length;
  }

  return { inserted: totalInserted, error: null };
}

/** Pre-defined city configs for the initial seed (mirrors the SQL migration). */
export const SEED_CITIES: CityConfig[] = [
  {
    name: 'Mumbai',
    zoom: 7,
    bbox: { minLat: 18.85, maxLat: 19.35, minLon: 72.75, maxLon: 73.05 },
  },
  {
    name: 'Delhi',
    zoom: 7,
    bbox: { minLat: 28.4, maxLat: 28.9, minLon: 76.85, maxLon: 77.4 },
  },
  {
    name: 'Bangalore',
    zoom: 7,
    bbox: { minLat: 12.8, maxLat: 13.2, minLon: 77.45, maxLon: 77.8 },
  },
  {
    name: 'Tokyo',
    zoom: 7,
    bbox: { minLat: 35.5, maxLat: 35.85, minLon: 139.55, maxLon: 139.95 },
  },
  {
    name: 'Singapore',
    zoom: 8,
    bbox: { minLat: 1.22, maxLat: 1.47, minLon: 103.6, maxLon: 104.0 },
  },
  {
    name: 'Dubai',
    zoom: 8,
    bbox: { minLat: 24.95, maxLat: 25.4, minLon: 55.0, maxLon: 55.55 },
  },
  {
    name: 'London',
    zoom: 7,
    bbox: { minLat: 51.3, maxLat: 51.7, minLon: -0.5, maxLon: 0.3 },
  },
  {
    name: 'Paris',
    zoom: 7,
    bbox: { minLat: 48.7, maxLat: 49.0, minLon: 2.2, maxLon: 2.55 },
  },
  {
    name: 'New York',
    zoom: 7,
    bbox: { minLat: 40.5, maxLat: 40.95, minLon: -74.3, maxLon: -73.7 },
  },
  {
    name: 'Sydney',
    zoom: 7,
    bbox: { minLat: -34.1, maxLat: -33.6, minLon: 150.9, maxLon: 151.4 },
  },
];
