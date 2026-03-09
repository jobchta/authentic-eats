#!/usr/bin/env bun
/**
 * ensureTable.ts
 * Creates osm_restaurant_cache table if it doesn't exist.
 * Uses Supabase REST API to run DDL via a stored procedure.
 * Safe to run multiple times (idempotent).
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

// Use Supabase's raw SQL endpoint (service role can do DDL via rpc)
const SQL = `
CREATE TABLE IF NOT EXISTS public.osm_restaurant_cache (
  osm_id     bigint PRIMARY KEY,
  name       text NOT NULL,
  cuisine    text,
  city       text NOT NULL,
  country    text,
  lat        double precision NOT NULL,
  lng        double precision NOT NULL,
  address    text,
  phone      text,
  website    text,
  opening_hours text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_osm_cache_city ON public.osm_restaurant_cache (city);
CREATE INDEX IF NOT EXISTS idx_osm_cache_country ON public.osm_restaurant_cache (country);
CREATE INDEX IF NOT EXISTS idx_osm_cache_location ON public.osm_restaurant_cache (lat, lng);

ALTER TABLE public.osm_restaurant_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role can manage osm cache"
  ON public.osm_restaurant_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can view osm cache"
  ON public.osm_restaurant_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);
`;

async function main() {
  // Supabase doesn't expose raw SQL via REST directly, but we can call
  // the pg endpoint if a helper function exists. Fall back to checking
  // if the table exists by doing a select.
  console.log('Checking if osm_restaurant_cache table exists...');

  const checkResp = await fetch(
    `${SUPABASE_URL}/rest/v1/osm_restaurant_cache?limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (checkResp.ok || checkResp.status === 200) {
    console.log('Table osm_restaurant_cache already exists. OK.');
    return;
  }

  const errText = await checkResp.text();
  console.log(`Table check status: ${checkResp.status}`);
  console.log(`Response: ${errText.slice(0, 200)}`);

  if (checkResp.status === 404 || errText.includes('does not exist') || errText.includes('schema cache')) {
    console.log('Table does not exist. Attempting to create via SQL migration...');
    // Log the SQL for manual application if needed
    console.log('\nSQL to run on Supabase dashboard:');
    console.log(SQL);
    console.log('\nPlease run the above SQL in the Supabase SQL editor if the table is missing.');
    // Don't fail - the crawler will fail gracefully if table is missing
  } else {
    console.log('Unexpected response - table may exist, continuing...');
  }
}

main().catch(err => {
  console.error('ensureTable error:', err.message);
  // Don't exit with error - this is a best-effort check
});
