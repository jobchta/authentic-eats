CREATE TABLE public.osm_restaurant_cache (
  osm_id bigint PRIMARY KEY,
  name text NOT NULL,
  cuisine text,
  city text NOT NULL,
  country text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  address text,
  phone text,
  website text,
  opening_hours text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.osm_restaurant_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached restaurants"
  ON public.osm_restaurant_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_osm_cache_city ON public.osm_restaurant_cache (city);
CREATE INDEX idx_osm_cache_fetched ON public.osm_restaurant_cache (fetched_at);