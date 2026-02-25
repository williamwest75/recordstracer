
-- Drop old founding member objects
DROP TABLE IF EXISTS public.founding_member_rate_limits;
DROP TABLE IF EXISTS public.founding_members;
DROP FUNCTION IF EXISTS public.get_founding_member_count();
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits();

-- Create new founding_members table
CREATE TABLE public.founding_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('agendatrace', 'recordtracer')),
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  founding_member_number INTEGER NOT NULL,
  CONSTRAINT founding_members_user_product_unique UNIQUE (user_id, product),
  CONSTRAINT founding_members_number_unique UNIQUE (founding_member_number)
);

-- Enable RLS
ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own rows
CREATE POLICY "Users can view own founding member status"
ON public.founding_members FOR SELECT
USING (auth.uid() = user_id);

-- Service role inserts only (via webhook edge function)
-- No public insert/update/delete policies needed

-- Create public view for count
CREATE OR REPLACE VIEW public.founding_members_count AS
SELECT COUNT(*)::integer AS total_count FROM public.founding_members;

-- Grant anon + authenticated access to the view
GRANT SELECT ON public.founding_members_count TO anon, authenticated;

-- Recreate get_founding_member_count function (used by frontend)
CREATE OR REPLACE FUNCTION public.get_founding_member_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.founding_members;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.founding_members;
