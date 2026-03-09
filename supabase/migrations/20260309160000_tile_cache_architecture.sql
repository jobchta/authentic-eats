-- PR-1: Tile-Cache Architecture for 2M restaurant scale
-- Creates three tables: area_tiles (manifest), tile_restaurants_cache (payload), search_requests (observability)
-- All tables have RLS enabled; reads are public, writes are service-role only.

-- ─────────────────────────────────────────────────────────────
-- 1. area_tiles  – one row per geo-tile / city shard
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.area_tiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_key      text NOT NULL UNIQUE,        -- e.g. "IN-MH-mumbai" or geohash "tter"
  city          text NOT NULL,
  country_code  text NOT NULL,               -- ISO 3166-1 alpha-2
  continent     text NOT NULL,
  bbox          jsonb,                       -- {north, south, east, west}
  geohash       text,                        -- 4-char geohash for spatial index
  record_count  integer NOT NULL DEFAULT 0,
  last_fetched_at timestamptz,
  next_refresh_at timestamptz GENERATED ALWAYS AS (
    last_fetched_at + interval '7 days'
  ) STORED,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','fetching','ready','error')),
  error_message text,
  source        text NOT NULL DEFAULT 'osm' CHECK (source IN ('osm','manual','import')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_area_tiles_city     ON public.area_tiles (city);
CREATE INDEX IF NOT EXISTS idx_area_tiles_geohash  ON public.area_tiles (geohash);
CREATE INDEX IF NOT EXISTS idx_area_tiles_status   ON public.area_tiles (status);
CREATE INDEX IF NOT EXISTS idx_area_tiles_refresh  ON public.area_tiles (next_refresh_at) WHERE status = 'ready';

ALTER TABLE public.area_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "area_tiles_public_read"
  ON public.area_tiles FOR SELECT
  USING (true);

CREATE POLICY "area_tiles_service_write"
  ON public.area_tiles FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.area_tiles IS
  'Manifest of geo-tiles. Each tile represents a city-shard that can hold up to ~10k cached restaurants.';

-- ─────────────────────────────────────────────────────────────
-- 2. tile_restaurants_cache  – the actual cached restaurant payloads
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tile_restaurants_cache (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_id         uuid NOT NULL REFERENCES public.area_tiles(id) ON DELETE CASCADE,
  payload         jsonb NOT NULL DEFAULT '[]',   -- array of OsmRestaurant-shaped objects
  total_count     integer NOT NULL DEFAULT 0,
  source_version  text,                          -- OSM data timestamp or import batch id
  cached_at       timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_stale        boolean GENERATED ALWAYS AS (now() > expires_at) STORED,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tile_cache_tile_id ON public.tile_restaurants_cache (tile_id);
CREATE INDEX IF NOT EXISTS idx_tile_cache_expires       ON public.tile_restaurants_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_tile_cache_stale         ON public.tile_restaurants_cache (is_stale);

ALTER TABLE public.tile_restaurants_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tile_cache_public_read"
  ON public.tile_restaurants_cache FOR SELECT
  USING (true);

CREATE POLICY "tile_cache_service_write"
  ON public.tile_restaurants_cache FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.tile_restaurants_cache IS
  'Cached restaurant payloads per tile. expires_at drives refresh logic; is_stale is a computed boolean.';

-- ─────────────────────────────────────────────────────────────
-- 3. search_requests  – observability & analytics
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_normalized text NOT NULL,             -- lowercased city/query for dedup counting
  tile_ids        uuid[] DEFAULT '{}',        -- which tiles were touched
  cache_hit       boolean NOT NULL DEFAULT false,
  source          text NOT NULL DEFAULT 'supabase'
                    CHECK (source IN ('supabase','osm','tile_cache','merged')),
  result_count    integer,
  latency_ms      integer,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_query     ON public.search_requests (query_normalized);
CREATE INDEX IF NOT EXISTS idx_search_created   ON public.search_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_cache_hit ON public.search_requests (cache_hit);

ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_requests_service_write"
  ON public.search_requests FOR INSERT
  WITH CHECK (auth.role() IN ('service_role', 'authenticated', 'anon'));

CREATE POLICY "search_requests_admin_read"
  ON public.search_requests FOR SELECT
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.search_requests IS
  'Observability table. Records every search with cache status, latency, and tile coverage.';

-- ─────────────────────────────────────────────────────────────
-- 4. Helper function – upsert a tile cache row
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_tile_cache(
  p_tile_id      uuid,
  p_payload      jsonb,
  p_total_count  integer,
  p_source_ver   text DEFAULT NULL,
  p_ttl_days     integer DEFAULT 7
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_id uuid;
BEGIN
  INSERT INTO public.tile_restaurants_cache
    (tile_id, payload, total_count, source_version, cached_at, expires_at)
  VALUES
    (p_tile_id, p_payload, p_total_count, p_source_ver,
     now(), now() + (p_ttl_days || ' days')::interval)
  ON CONFLICT (tile_id) DO UPDATE SET
    payload        = EXCLUDED.payload,
    total_count    = EXCLUDED.total_count,
    source_version = EXCLUDED.source_version,
    cached_at      = now(),
    expires_at     = now() + (p_ttl_days || ' days')::interval
  RETURNING id INTO v_cache_id;

  -- keep area_tiles in sync
  UPDATE public.area_tiles
  SET
    record_count    = p_total_count,
    last_fetched_at = now(),
    status          = 'ready',
    updated_at      = now()
  WHERE id = p_tile_id;

  RETURN v_cache_id;
END;
$$;

COMMENT ON FUNCTION public.upsert_tile_cache IS
  'Atomically upsert a tile cache payload and update the parent area_tiles status.';
