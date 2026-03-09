-- The newsletter INSERT policy with "WITH CHECK (true)" is intentional for public signups
-- No change needed there

-- Fix any remaining permissive policies - check for INSERT/UPDATE/DELETE with true
-- Looking at the existing policies, only newsletter_subscribers has INSERT with true which is intentional