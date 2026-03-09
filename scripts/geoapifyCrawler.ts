#!/usr/bin/env bun
/**
 * Geoapify Places Crawler - Gets 50k restaurants/day FREE
 * 3000 credits/day = ~50,000 restaurants
 * No rate limits, can cache forever
 */
import { createClient } from '@supabase/supabase-js';

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 500;
const RESULTS_PER_REQUEST = 100; // Max 100 places per request

if (!GEOAPIFY_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

// Major cities to crawl
const CITIES = [
  { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777, radius: 50000 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, radius: 50000 },
  { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198, radius: 30000 },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708, radius: 40000 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, radius: 50000 },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, radius: 40000 },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, radius: 50000 },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, radius: 40000 },
    { name: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090, radius: 50000 },
  { name: 'Bangalore', country: 'IN', lat: 12.9716, lon: 77.5946, radius: 50000 },
  { name: 'Los Angeles', country: 'US', lat: 34.0522, lon: -118.2437, radius: 50000 },
  { name: 'Chicago', country: 'US', lat: 41.8781, lon: -87.6298, radius: 50000 },
  { name: 'Toronto', country: 'CA', lat: 43.6532, lon: -79.3832, radius: 50000 },
  { name: 'Mexico City', country: 'MX', lat: 19.4326, lon: -99.1332, radius: 50000 },
  { name: 'Sao Paulo', country: 'BR', lat: -23.5505, lon: -46.6333, radius: 50000 },
  { name: 'Buenos Aires', country: 'AR', lat: -34.6037, lon: -58.3816, radius: 40000 },
  { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050, radius: 50000 },
  { name: 'Madrid', country: 'ES', lat: 40.4168, lon: -3.7038, radius: 50000 },
  { name: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964, radius: 50000 },
  { name: 'Istanbul', country: 'TR', lat: 41.0082, lon: 28.9784, radius: 50000 },
  { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357, radius: 50000 },
  { name: 'Bangkok', country: 'TH', lat: 13.7563, lon: 100.5018, radius: 50000 },
  { name: 'Seoul', country: 'KR', lat: 37.5665, lon: 126.9780, radius: 50000 },
  { name: 'Shanghai', country: 'CN', lat: 31.2304, lon: 121.4737, radius: 50000 },
  { name: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074, radius: 50000 },
  { name: 'Hong Kong', country: 'HK', lat: 22.3193, lon: 114.1694, radius: 30000 },
  { name: 'Jakarta', country: 'ID', lat: -6.2088, lon: 106.8456, radius: 50000 },
  { name: 'Manila', country: 'PH', lat: 14.5995, lon: 120.9842, radius: 50000 },
  { name: 'Melbourne', country: 'AU', lat: -37.8136, lon: 144.9631, radius: 50000 },
  { name: 'Amsterdam', country: 'NL', lat: 52.3676, lon: 4.9041, radius: 30000 },
  { name: 'Barcelona', country: 'ES', lat: 41.3851, lon: 2.1734, radius: 50000 },
  { name: 'Lisbon', country: 'PT', lat: 38.7223, lon: -9.1393, radius: 40000 },
  { name: 'Vienna', country: 'AT', lat: 48.2082, lon: 16.3738, radius: 40000 },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchRestaurants(city: typeof CITIES[0], offset = 0) {
  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', 'catering.restaurant,catering.cafe,catering.fast_food');
  url.searchParams.set('filter', `circle:${city.lon},${city.lat},${city.radius}`);
  url.searchParams.set('limit', RESULTS_PER_REQUEST.toString());
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('apiKey', GEOAPIFY_KEY);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Geoapify HTTP ${resp.status}`);
  
  const data = await resp.json();
  return data.features ?? [];
}

function mapPlace(feature: any, city: typeof CITIES[0]) {
  const props = feature.properties;
  const coords = feature.geometry?.coordinates;
  if (!coords) return null;

  return {
    osm_id: Math.abs((coords[0] * 1000000 + coords[1] * 1000000 + (props.name?.length || 0)) | 0),
    name: props.name ?? 'Unnamed',
    cuisine: props.cuisine ?? null,
    city: props.city ?? city.name,
    country: props.country_code?.toUpperCase() ?? city.country,
    lat: coords[1],
    lon: coords[0],
    street: props.street ?? null,
    housenumber: props.housenumber ?? null,
    postcode: props.postcode ?? null,
    phone: props.contact?.phone ?? null,
    website: props.website ?? props.contact?.website ?? null,
    opening_hours: props.opening_hours ?? null,
    wheelchair: null,
    outdoor_seating: null,
    delivery: null,
    takeaway: null,
    amenity: props.categories?.[0] ?? 'restaurant'
  };
}

async function upsertBatch(rows: any[]) {
  let total = 0;
    // Deduplicate by osm_id to avoid ON CONFLICT errors
  const seen = new Map();
  rows = rows.filter(row => {
    if (seen.has(row.osm_id)) return false;
    seen.set(row.osm_id, true);
    return true;
  });
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error, count } = await supabase
      .from('osm_restaurant_cache')
      .upsert(batch, { onConflict: 'osm_id', count: 'exact' });
    if (error) throw new Error(`Supabase: ${error.message}`);
    total += count ?? batch.length;
  }
  return total;
}

async function main() {
  console.log('=== Geoapify Restaurant Crawler ===');
  console.log(`Free tier: 3000 credits/day = ~50k restaurants\n`);

    // Reload PostgREST schema cache
  try {
    await supabase.rpc('reload_postgrest_schema');
    console.log('Schema cache reloaded.');
  } catch (e: any) {
    console.log(`Schema reload skipped: ${e?.message ?? 'error'}`);
  }

  let grandTotal = 0;
  
  for (const city of CITIES) {
    console.log(`\n[${city.name}] Crawling...`);
    let offset = 0;
    let cityTotal = 0;

    while (offset < 1000) { // Max 1000 results per city
      try {
        const features = await fetchRestaurants(city, offset);
        if (features.length === 0) break;

        const rows = features.map((f: any) => mapPlace(f, city)).filter(Boolean);
        console.log(`  Offset ${offset}: Got ${rows.length} places`);

        if (rows.length > 0) {
          const inserted = await upsertBatch(rows);
          cityTotal += inserted;
          grandTotal += inserted;
          console.log(`  Inserted ${inserted} (city total: ${cityTotal})`);
        }

        offset += RESULTS_PER_REQUEST;
        await sleep(500); // Rate limit protection
      } catch (err: any) {
        console.error(`  ERROR: ${err.message}`);
        break;
      }
    }

    console.log(`[${city.name}] Done: ${cityTotal} restaurants`);
  }

  console.log(`\n=== DONE. Total inserted: ${grandTotal} ===`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
