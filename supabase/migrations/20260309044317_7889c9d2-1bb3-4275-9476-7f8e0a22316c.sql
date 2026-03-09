-- Restrict osm_restaurant_cache to authenticated users only
DROP POLICY IF EXISTS "Anyone can view cached restaurants" ON public.osm_restaurant_cache;

CREATE POLICY "Authenticated users can view cached restaurants"
ON public.osm_restaurant_cache
FOR SELECT
TO authenticated
USING (true);