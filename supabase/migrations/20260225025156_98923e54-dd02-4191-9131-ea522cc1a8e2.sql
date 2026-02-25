
-- Remove overly permissive policy that would expose all rows
DROP POLICY IF EXISTS "Anyone can count founding members" ON public.founding_members;
