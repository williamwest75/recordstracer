
-- Monthly search usage tracking
CREATE TABLE public.search_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_year text NOT NULL, -- format: 'YYYY-MM'
  search_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_year)
);

ALTER TABLE public.search_usage ENABLE ROW LEVEL SECURITY;

-- Users can view own usage
CREATE POLICY "Users can view own search usage"
  ON public.search_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No client-side insert/update (server-side only via service role)
CREATE POLICY "No client insert search usage"
  ON public.search_usage FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "No client update search usage"
  ON public.search_usage FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "No client delete search usage"
  ON public.search_usage FOR DELETE
  TO public
  USING (false);

-- Function to increment search count and return current count + tier limit
CREATE OR REPLACE FUNCTION public.increment_search_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month text;
  new_count integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO public.search_usage (user_id, month_year, search_count)
  VALUES (p_user_id, current_month, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET search_count = search_usage.search_count + 1, updated_at = now()
  RETURNING search_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Function to get current month search count
CREATE OR REPLACE FUNCTION public.get_search_usage(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT search_count FROM public.search_usage 
     WHERE user_id = p_user_id AND month_year = to_char(now(), 'YYYY-MM')),
    0
  );
$$;
