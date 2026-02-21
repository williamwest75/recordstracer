
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can read user_roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can read founding_members
CREATE POLICY "Admins can read founding members"
  ON public.founding_members FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Deny all SELECT on rate_limits (only accessed via service role in edge function)
CREATE POLICY "No public read on rate limits"
  ON public.founding_member_rate_limits FOR SELECT
  USING (false);

-- Deny all INSERT on rate limits from client (only edge function with service role)
CREATE POLICY "No public insert on rate limits"
  ON public.founding_member_rate_limits FOR INSERT
  WITH CHECK (false);
