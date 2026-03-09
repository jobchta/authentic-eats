-- osm_restaurant_cache v2: ensure table exists for crawler ingestion
-- This is idempotent - safe to run multiple times

CREATE TABLE IF NOT EXISTS public.osm_restaurant_cache (
  osm_id        bigint PRIMARY KEY,
  name          text NOT NULL DEFAULT 'Unnamed',
  cuisine       text,
  city          text NOT NULL DEFAULT '',
  country       text,
  lat           double precision NOT NULL,
  lng           double precision NOT NULL,
  address       text,
  phone         text,
  website       text,
  opening_hours text,
  fetched_at    timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_osm_cache_city
  ON public.osm_restaurant_cache (city);

CREATE INDEX IF NOT EXISTS idx_osm_cache_country
  ON public.osm_restaurant_cache (country);

CREATE INDEX IF NOT EXISTS idx_osm_cache_lat_lng
  ON public.osm_restaurant_cache (lat, lng);

CREATE INDEX IF NOT EXISTS idx_osm_cache_name
  ON public.osm_restaurant_cache (name);

-- RLS
ALTER TABLE public.osm_restaurant_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'osm_restaurant_cache'
    AND policyname = 'Service role full access to osm cache'
  ) THEN
    CREATE POLICY "Service role full access to osm cache"
      ON public.osm_restaurant_cache
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'osm_restaurant_cache'
    AND policyname = 'Public read access to osm cache'
  ) THEN
    CREATE POLICY "Public read access to osm cache"
      ON public.osm_restaurant_cache
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Comment
COMMENT ON TABLE public.osm_restaurant_cache IS

  -- Helper function: reload PostgREST schema cache
-- Called by crawler to ensure new tables are visible to PostgREST
CREATE OR REPLACE FUNCTION public.reload_postgrest_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

GRANT EXECUTE ON FUNCTION public.reload_postgrest_schema() TO service_role;
  'OSM bulk restaurant data crawled by GitHub Actions. 2M+ records target.';
