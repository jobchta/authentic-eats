#!/usr/bin/env bun
/**
 * crawlTiles.ts - BBOX TILE MODE
 * Splits countries into 2x2 degree bounding box tiles.
 * Each tile query is small enough for Overpass to handle reliably.
 * Upserts into osm_restaurant_cache table.
 * Reads CITY_FILTER and MAX_TILES from env (set by workflow_dispatch inputs).
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CITY_FILTER = process.env.CITY_FILTER || '';
const MAX_TILES = parseInt(process.env.MAX_TILES || '50', 10);
const BATCH_INSERT = 500;
const TILE_DEG = 2; // 2x2 degree tiles

// Overpass mirrors to rotate through on error
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Country bounding boxes [minLat, minLon, maxLat, maxLon]
const COUNTRIES: { name: string; code: string; bbox: [number, number, number, number] }[] = [
  { name: 'India',     code: 'IN', bbox: [6.5,  68.0,  37.5, 97.5] },
  { name: 'Japan',     code: 'JP', bbox: [24.0, 122.0, 46.0, 146.0] },
  { name: 'Singapore', code: 'SG', bbox: [1.15, 103.6, 1.47, 104.1] },
  { name: 'UAE',       code: 'AE', bbox: [22.5, 51.0,  26.1, 56.5] },
  { name: 'UK',        code: 'GB', bbox: [49.8, -8.2,  60.9, 2.0] },
  { name: 'France',    code: 'FR', bbox: [41.3, -5.2,  51.1, 9.7] },
  { name: 'USA',       code: 'US', bbox: [24.5, -125.0, 49.5, -66.9] },
  { name: 'Australia', code: 'AU', bbox: [-43.6, 113.3, -10.7, 153.6] },
  { name: 'Germany',   code: 'DE', bbox: [47.3,  5.8,  55.1, 15.1] },
  { name: 'Brazil',    code: 'BR', bbox: [-33.8, -73.9, 5.3, -34.7] },
];

interface Tile {
  country: string;
  code: string;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
  key: string;
}

function generateTiles(filter: string): Tile[] {
  const tiles: Tile[] = [];
  const countries = filter
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.code.toLowerCase() === filter.toLowerCase()
      )
    : COUNTRIES;

  for (const country of countries) {
    const [minLat, minLon, maxLat, maxLon] = country.bbox;
    for (let lat = minLat; lat < maxLat; lat += TILE_DEG) {
      for (let lon = minLon; lon < maxLon; lon += TILE_DEG) {
        const s = parseFloat(Math.max(lat, minLat).toFixed(4));
        const w = parseFloat(Math.max(lon, minLon).toFixed(4));
        const n = parseFloat(Math.min(lat + TILE_DEG, maxLat).toFixed(4));
        const e = parseFloat(Math.min(lon + TILE_DEG, maxLon).toFixed(4));
        tiles.push({
          country: country.name,
          code: country.code,
          minLat: s, minLon: w, maxLat: n, maxLon: e,
          key: `${country.code}:${s},${w},${n},${e}`,
        });
      }
    }
  }
  return tiles;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchTile(tile: Tile, mirrorIdx = 0): Promise<any[]> {
  const { minLat, minLon, maxLat, maxLon } = tile;
  const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;
  const query = `[out:json][timeout:60][bbox:${bbox}];
(
  node["amenity"="restaurant"];
  way["amenity"="restaurant"];
  node["amenity"="cafe"];
  way["amenity"="cafe"];
  node["amenity"="fast_food"];
  way["amenity"="fast_food"];
);
out center tags;`;

  const mirror = OVERPASS_MIRRORS[mirrorIdx % OVERPASS_MIRRORS.length];
  const resp = await fetch(mirror, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(90_000),
  });

  if (!resp.ok) {
    const text = await resp.text();
    if (resp.status >= 500 && mirrorIdx < OVERPASS_MIRRORS.length - 1) {
      console.log(`  [retry] Mirror ${mirror} failed (${resp.status}), trying next...`);
      await sleep(3000);
      return fetchTile(tile, mirrorIdx + 1);
    }
    throw new Error(`Overpass HTTP ${resp.status}: ${text.slice(0, 150)}`);
  }

  const data = await resp.json() as { elements: any[] };
  return data.elements ?? [];
}

function mapElement(el: any, tile: Tile): any {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;
  const tags = el.tags ?? {};
  const osmId = Number(el.id);
  if (!osmId) return null;

  // Derive city from tags or use country as fallback
  const city = tags['addr:city'] ?? tags['is_in:city'] ?? tags['addr:county'] ?? tile.country;

  return {
    osm_id: osmId,
    name: tags.name ?? tags['name:en'] ?? 'Unnamed',
    cuisine: tags.cuisine ?? null,
    city,
    country: tile.code,
    lat,
    lng: lon,
    street: tags['addr:street'] ?? null,
    housenumber: tags['addr:housenumber'] ?? null,
    postcode: tags['addr:postcode'] ?? null,    phone: tags.phone ?? tags['contact:phone'] ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    opening_hours: tags.opening_hours ?? null,
        wheelchair: tags.wheelchair ?? null,
    outdoor_seating: tags.outdoor_seating ?? null,
    delivery: tags.delivery ?? null,
    takeaway: tags.takeaway ?? null,
    amenity: tags.amenity ?? null,
  };
}

async function upsertBatch(rows: any[]): Promise<number> {
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_INSERT) {
    const batch = rows.slice(i, i + BATCH_INSERT);
    const { error, count } = await supabase
      .from('osm_restaurant_cache')
      .upsert(batch, { onConflict: 'osm_id', count: 'exact' });
    if (error) throw new Error(`Supabase upsert error: ${error.message}`);
    total += count ?? batch.length;
    if (i % 5000 === 0 && i > 0) await sleep(300);
  }
  return total;
}

async function main() {
  console.log('=== OSM Restaurant Tile Crawler ===');
  console.log(`Target table: osm_restaurant_cache`);
  console.log(`City/country filter: "${CITY_FILTER || 'all countries'}"`);
  console.log(`Max tiles per run: ${MAX_TILES}`);
  console.log('');
    // Reload PostgREST schema cache to ensure osm_restaurant_cache is visible
  try {
    await supabase.rpc('reload_postgrest_schema');
    console.log('PostgREST schema cache refreshed.');
  } catch (e: any) {
    console.log(`Schema reload skipped (${e?.message?.slice(0, 60) ?? 'no error'}) - continuing...`);
  }

  const allTiles = generateTiles(CITY_FILTER);
  console.log(`Total tiles generated: ${allTiles.length}`);

  const tiles = allTiles.slice(0, MAX_TILES);
  console.log(`Processing ${tiles.length} tiles this run`);
  console.log('');

  const report: any[] = [];
  let grandTotal = 0;
  let tileIdx = 0;

  for (const tile of tiles) {
    tileIdx++;
    const start = Date.now();
    console.log(`[${tileIdx}/${tiles.length}] ${tile.key}`);
    try {
      const elements = await fetchTile(tile);
      const rows = elements.map(el => mapElement(el, tile)).filter(Boolean);
      console.log(`  Got ${elements.length} elements -> ${rows.length} valid`);

      if (rows.length > 0) {
        const inserted = await upsertBatch(rows);
        grandTotal += inserted;
        console.log(`  Upserted ${inserted} rows (running total: ${grandTotal})`);
      }

      const elapsed = Math.round((Date.now() - start) / 1000);
      report.push({ tile: tile.key, count: rows.length, elapsed, status: 'ok' });
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
      report.push({ tile: tile.key, error: err.message, status: 'error' });
    }

    // Respect Overpass fair-use: 1s between tiles
    await sleep(1000);
  }

  console.log('');
  console.log(`=== DONE. Total upserted: ${grandTotal} ===`);
  console.log(`Tiles processed: ${tileIdx} / Total available: ${allTiles.length}`);

  fs.writeFileSync('crawl-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    city_filter: CITY_FILTER,
    max_tiles: MAX_TILES,
    tiles_processed: tileIdx,
    tiles_available: allTiles.length,
    total_upserted: grandTotal,
    tiles: report,
  }, null, 2));
  console.log('Report written to crawl-report.json');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
