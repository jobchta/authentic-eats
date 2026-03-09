-- P1: Fix RLS - The edge function uses service_role which bypasses RLS,
-- but we need INSERT/UPDATE policies for ingestion_jobs so admin dashboard works.
-- Service role already bypasses RLS, so the real issue is the edge function is fine.
-- But let's add proper policies for completeness and for any future non-service-role usage.

-- Allow service-role-based inserts on ingestion_jobs (for admin operations)
CREATE POLICY "Service role can insert ingestion jobs"
ON public.ingestion_jobs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update ingestion jobs"
ON public.ingestion_jobs
FOR UPDATE
TO service_role
USING (true);

-- P2: Add unique constraint to prevent duplicate dishes per country
CREATE UNIQUE INDEX IF NOT EXISTS idx_dishes_name_country_unique 
ON public.dishes (lower(name), country_id);

-- P3: Add unique constraint for ingredients by name
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredients_name_unique 
ON public.ingredients (lower(name));