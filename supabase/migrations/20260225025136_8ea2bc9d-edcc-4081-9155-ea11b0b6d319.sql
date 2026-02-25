
-- Fix: Make the view security invoker instead of definer
DROP VIEW IF EXISTS public.founding_members_count;
CREATE VIEW public.founding_members_count 
WITH (security_invoker = true)
AS SELECT COUNT(*)::integer AS total_count FROM public.founding_members;

-- Re-grant access
GRANT SELECT ON public.founding_members_count TO anon, authenticated;

-- Add a permissive SELECT policy so the view (running as invoker) can count rows
CREATE POLICY "Anyone can count founding members"
ON public.founding_members FOR SELECT
USING (true);
