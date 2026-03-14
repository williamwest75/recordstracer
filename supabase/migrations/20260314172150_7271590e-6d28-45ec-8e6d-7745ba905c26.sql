
-- Investigation sharing for collaborative investigations
CREATE TABLE public.investigation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_by UUID NOT NULL,
  permission TEXT NOT NULL DEFAULT 'read' CHECK (permission IN ('read', 'edit')),
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investigation_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage shares
CREATE POLICY "Owner can manage shares"
  ON public.investigation_shares FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- Shared users can view their shares
CREATE POLICY "Users can view shares for them"
  ON public.investigation_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Shared users can view shared investigations (read or edit)
CREATE POLICY "Shared users can view investigations"
  ON public.investigations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.investigation_shares s
      JOIN auth.users u ON u.email = s.shared_with_email
      WHERE s.investigation_id = investigations.id
        AND u.id = auth.uid()
    )
  );

-- Shared users with edit permission can update investigations
CREATE POLICY "Shared users can edit investigations"
  ON public.investigations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.investigation_shares s
      JOIN auth.users u ON u.email = s.shared_with_email
      WHERE s.investigation_id = investigations.id
        AND u.id = auth.uid()
        AND s.permission = 'edit'
    )
  );

-- Shared users can view saved results in shared investigations
CREATE POLICY "Shared users can view shared saved results"
  ON public.saved_results FOR SELECT
  TO authenticated
  USING (
    investigation_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.investigation_shares s
      JOIN auth.users u ON u.email = s.shared_with_email
      WHERE s.investigation_id = saved_results.investigation_id
        AND u.id = auth.uid()
    )
  );

-- Alert subscriptions for email alerts on new records
CREATE TABLE public.search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_name TEXT NOT NULL,
  state TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_result_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.search_alerts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
