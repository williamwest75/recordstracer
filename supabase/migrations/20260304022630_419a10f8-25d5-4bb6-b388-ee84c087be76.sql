
-- 1. Recreate founding_members_count as a security-invoker view
-- This means the view runs with the caller's permissions, so the
-- underlying founding_members RLS policies are enforced
DROP VIEW IF EXISTS public.founding_members_count;

CREATE VIEW public.founding_members_count
WITH (security_invoker = on) AS
  SELECT COUNT(*)::integer AS total_count
  FROM public.founding_members;

-- Grant select on the view to authenticated and anon roles
GRANT SELECT ON public.founding_members_count TO authenticated;
GRANT SELECT ON public.founding_members_count TO anon;

-- 2. Harden founding_members table — block direct INSERT/UPDATE/DELETE from clients
-- Only the server (service role via stripe-webhook) should write to this table
CREATE POLICY "No client insert on founding_members"
  ON public.founding_members
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No client update on founding_members"
  ON public.founding_members
  FOR UPDATE
  USING (false);

CREATE POLICY "No client delete on founding_members"
  ON public.founding_members
  FOR DELETE
  USING (false);

-- 3. Allow admins to view all founding members (for admin dashboard)
CREATE POLICY "Admins can view all founding members"
  ON public.founding_members
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
