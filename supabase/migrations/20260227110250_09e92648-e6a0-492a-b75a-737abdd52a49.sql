
ALTER TABLE public.searches
  ADD COLUMN result_count integer DEFAULT 0,
  ADD COLUMN database_count integer DEFAULT 0,
  ADD COLUMN risk_level text DEFAULT NULL,
  ADD COLUMN flag_count jsonb DEFAULT '{}'::jsonb;
