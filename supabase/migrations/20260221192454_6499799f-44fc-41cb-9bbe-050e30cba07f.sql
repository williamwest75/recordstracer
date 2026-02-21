-- Create a rate limiting table for founding member signups
CREATE TABLE public.founding_member_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS (no user policies needed - accessed via edge function with service role)
ALTER TABLE public.founding_member_rate_limits ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups by IP and time
CREATE INDEX idx_rate_limits_ip_created ON public.founding_member_rate_limits (ip_address, created_at DESC);

-- Auto-cleanup old entries (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.founding_member_rate_limits WHERE created_at < now() - interval '2 hours';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_rate_limits_trigger
AFTER INSERT ON public.founding_member_rate_limits
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_rate_limits();