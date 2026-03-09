#!/usr/bin/env bun
/**
 * crawlTiles.ts - BULK MODE
 * Queries OSM Overpass API per country/region in one shot.
 * Gets 500k-2M records in a single 45-min GitHub Actions run.
 * No tile-by-tile crawling needed for initial seed.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BATCH_INSERT = 500;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// BULK REGIONS - each query fetches ALL restaurants in that country/area
// Overpass timeout=300 handles large countries fine
const REGIONS = [
  { name: 'India',     query: '["ISO3166-1"="IN"]' },
  { name: 'Japan',     query: '["ISO3166-1"="JP"]' },
  { name: 'Singapore', query: '["ISO3166-1"="SG"]' },
  { name: 'UAE',       query: '["ISO3166-1"="AE"]' },
  { name: 'UK',        query: '["ISO3166-1"="GB"]' },
  { name: 'France',    query: '["ISO3166-1"="FR"]' },
  { name: 'USA-NY',    query: '["name"="New York"]["admin_level"="4"]' },
  { name: 'Australia', query: '["ISO3166-1"="AU"]' },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchCountryRestaurants(region: typeof REGIONS[0]): Promise<any[]> {
  const query = `[out:json][timeout:300];
area${region.query}->.r;
(
  node["amenity"="restaurant"](area.r);
  way["amenity"="restaurant"](area.r);
);
out center tags;`;

  console.log(`  Querying Overpass for ${region.name}...`);
  const resp = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(360_000),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Overpass HTTP ${resp.status}: ${text.slice(0, 200)}`);
  }

  const data = await resp.json() as { elements: any[] };
  return data.elements ?? [];
}

function mapElement(el: any): any {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;
  const tags = el.tags ?? {};
  return {
    osm_id: String(el.id),
    name: tags.name ?? tags['name:en'] ?? 'Unnamed',
    lat,
    lon,
    address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
      .filter(Boolean).join(', ') || null,
    cuisine: tags.cuisine ?? null,
    phone: tags.phone ?? tags['contact:phone'] ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    opening_hours: tags.opening_hours ?? null,
    raw_tags: tags,
  };
}

async function upsertBatch(rows: any[]): Promise<number> {
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_INSERT) {
    const batch = rows.slice(i, i + BATCH_INSERT);
    const { error, count } = await supabase
      .from('restaurants')
      .upsert(batch, { onConflict: 'osm_id', count: 'exact' });
    if (error) throw new Error(`Supabase upsert error: ${error.message}`);
    total += count ?? batch.length;
    // Small pause to not hammer Supabase rate limits
    if (i % 5000 === 0 && i > 0) await sleep(500);
  }
  return total;
}

async function main() {
  console.log('=== BULK OSM Restaurant Import ===');
  console.log(`Target: ${REGIONS.map(r => r.name).join(', ')}`);
  console.log('');

  const report: any[] = [];
  let grandTotal = 0;

  for (const region of REGIONS) {
    const start = Date.now();
    console.log(`[${region.name}] Starting...`);
    try {
      const elements = await fetchCountryRestaurants(region);
      console.log(`[${region.name}] Got ${elements.length} elements from Overpass`);

      const rows = elements.map(mapElement).filter(Boolean);
      console.log(`[${region.name}] Mapped ${rows.length} valid restaurants`);

      if (rows.length > 0) {
        const inserted = await upsertBatch(rows);
        grandTotal += inserted;
        console.log(`[${region.name}] Upserted ${inserted} rows to Supabase`);
      }

      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`[${region.name}] Done in ${elapsed}s`);
      report.push({ region: region.name, count: rows.length, elapsed, status: 'ok' });
    } catch (err: any) {
      console.error(`[${region.name}] ERROR: ${err.message}`);
      report.push({ region: region.name, error: err.message, status: 'error' });
    }

    // 5s between country queries to respect Overpass fair-use
    await sleep(5000);
  }

  console.log('');
  console.log(`=== DONE. Total restaurants upserted: ${grandTotal} ===`);

  fs.writeFileSync('crawl-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    total: grandTotal,
    regions: report,
  }, null, 2));

  console.log('Report written to crawl-report.json');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
