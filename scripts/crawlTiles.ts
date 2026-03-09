#!/usr/bin/env bun
/**
 * crawlTiles.ts
 * OSM Overpass crawler — picks up to MAX_TILES pending area_tiles,
 * queries OpenStreetMap for amenity=restaurant nodes inside each tile,
 * upserts them into the restaurants table, then marks the tile done.
 *
 * Free tier budget:
 *   - Overpass API: free, rate-limit ~1 req/s
 *   - Supabase: 500MB DB, 2GB bandwidth/month on free plan
 *   - GitHub Actions: 2000 min/month on free plan
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MAX_TILES = parseInt(process.env.MAX_TILES ?? '50', 10);
const CITY_FILTER = process.env.CITY_FILTER ?? '';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RATE_LIMIT_MS = 1200; // 1.2s between requests to respect Overpass

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Convert tile XY + zoom to WGS84 bounding box. */
function tileToBbox(zoom: number, x: number, y: number) {
  const n = Math.pow(2, zoom);
  const lonMin = (x / n) * 360 - 180;
  const lonMax = ((x + 1) / n) * 360 - 180;
  const latMaxRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latMinRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
  return {
    latMin: (latMinRad * 180) / Math.PI,
    latMax: (latMaxRad * 180) / Math.PI,
    lonMin,
    lonMax,
  };
}

/** Build Overpass QL query for restaurants in a bbox. */
function buildQuery(latMin: number, latMax: number, lonMin: number, lonMax: number) {
  return `[out:json][timeout:30];
(
  node["amenity"="restaurant"](${latMin},${lonMin},${latMax},${lonMax});
  way["amenity"="restaurant"](${latMin},${lonMin},${latMax},${lonMax});
);
out center tags;`;
}

/** Sleep helper. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch restaurants from Overpass for a single tile. */
async function fetchRestaurantsForTile(
  zoom: number, x: number, y: number
): Promise<any[]> {
  const bbox = tileToBbox(zoom, x, y);
  const query = buildQuery(bbox.latMin, bbox.latMax, bbox.lonMin, bbox.lonMax);

  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!resp.ok) {
    throw new Error(`Overpass HTTP ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json() as { elements: any[] };
  return data.elements ?? [];
}

/** Map an Overpass element to our restaurants row schema. */
function mapElement(el: any, tileId: string) {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const tags = el.tags ?? {};
  return {
    osm_id: String(el.id),
    name: tags.name ?? tags['name:en'] ?? 'Unnamed',
    lat,
    lon,
    address: [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
    ].filter(Boolean).join(', ') || null,
    cuisine: tags.cuisine ?? null,
    phone: tags.phone ?? tags['contact:phone'] ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    opening_hours: tags.opening_hours ?? null,
    tile_id: tileId,
    raw_tags: tags,
  };
}

async function main() {
  console.log(`Starting OSM crawler | MAX_TILES=${MAX_TILES} | CITY_FILTER=${CITY_FILTER || 'none'}`);

  // 1. Fetch pending tiles
  let query = supabase
    .from('area_tiles')
    .select('id, zoom, x, y')
    .eq('status', 'pending')
    .order('updated_at', { ascending: true })
    .limit(MAX_TILES);

  const { data: tiles, error: tilesErr } = await query;
  if (tilesErr) throw tilesErr;
  if (!tiles || tiles.length === 0) {
    console.log('No pending tiles found. Exiting.');
    process.exit(0);
  }

  console.log(`Processing ${tiles.length} tiles...`);

  const report: any[] = [];
  let totalRestaurants = 0;

  for (const tile of tiles) {
    const start = Date.now();
    // Mark tile as in_progress
    await supabase.from('area_tiles').update({ status: 'in_progress' }).eq('id', tile.id);

    try {
      const elements = await fetchRestaurantsForTile(tile.zoom, tile.x, tile.y);
      const rows = elements
        .filter((el) => el.lat != null || el.center != null)
        .map((el) => mapElement(el, tile.id));

      if (rows.length > 0) {
        // Upsert in batches of 200
        for (let i = 0; i < rows.length; i += 200) {
          const { error } = await supabase
            .from('restaurants')
            .upsert(rows.slice(i, i + 200), { onConflict: 'osm_id' });
          if (error) throw error;
        }
      }

      totalRestaurants += rows.length;

      await supabase.from('area_tiles').update({
        status: 'done',
        last_crawled_at: new Date().toISOString(),
        restaurant_count: rows.length,
      }).eq('id', tile.id);

      const elapsed = Date.now() - start;
      console.log(`[OK] tile z${tile.zoom}/${tile.x}/${tile.y} -> ${rows.length} restaurants (${elapsed}ms)`);
      report.push({ tile: `${tile.zoom}/${tile.x}/${tile.y}`, count: rows.length, elapsed, status: 'ok' });
    } catch (err: any) {
      console.error(`[ERR] tile z${tile.zoom}/${tile.x}/${tile.y}: ${err.message}`);
      await supabase.from('area_tiles').update({ status: 'error' }).eq('id', tile.id);
      report.push({ tile: `${tile.zoom}/${tile.x}/${tile.y}`, error: err.message, status: 'error' });
    }

    // Rate limit
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\nDone. Total restaurants upserted: ${totalRestaurants}`);

  // Write report for artifact upload
  fs.writeFileSync('crawl-report.json', JSON.stringify({ tiles: report, total: totalRestaurants }, null, 2));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
