-- Create a secure function to get founding member count without exposing data
CREATE OR REPLACE FUNCTION public.get_founding_member_count()
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.founding_members;
$$;

-- Drop the overly permissive SELECT policy that exposes all data
DROP POLICY IF EXISTS "Anyone can count founding members" ON public.founding_members;

-- Create a restrictive SELECT policy that only allows authenticated admins (or nobody)
-- The count is now accessed via the RPC function above
-- Keep INSERT open but add basic validation
DROP POLICY IF EXISTS "Anyone can insert founding members" ON public.founding_members;

CREATE POLICY "Anyone can insert founding members"
ON public.founding_members
FOR INSERT
WITH CHECK (
  -- Basic validation: name and email must not be empty
  length(trim(name)) > 0 AND
  length(trim(email)) > 3 AND
  email ~ '^[^@]+@[^@]+\.[^@]+$'
);