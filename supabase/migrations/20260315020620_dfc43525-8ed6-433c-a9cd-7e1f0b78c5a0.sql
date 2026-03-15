CREATE TABLE public.link_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL,
  state_code text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  source_name text NOT NULL,
  status_code integer,
  is_healthy boolean NOT NULL DEFAULT true,
  error_message text,
  response_time_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_link_health_state ON public.link_health(state_code);
CREATE INDEX idx_link_health_checked ON public.link_health(checked_at DESC);
CREATE INDEX idx_link_health_unhealthy ON public.link_health(is_healthy) WHERE NOT is_healthy;

ALTER TABLE public.link_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view link health" ON public.link_health
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No client writes on link_health" ON public.link_health
  FOR INSERT TO public
  WITH CHECK (false);

CREATE POLICY "No client update on link_health" ON public.link_health
  FOR UPDATE TO public
  USING (false);

CREATE POLICY "No client delete on link_health" ON public.link_health
  FOR DELETE TO public
  USING (false);