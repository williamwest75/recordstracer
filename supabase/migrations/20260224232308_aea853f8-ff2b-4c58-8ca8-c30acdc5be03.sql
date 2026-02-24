
-- Add unique constraint for upsert on stripe_subscription_id
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);

-- Allow service role (used by edge functions) to insert and update subscriptions
-- The service role bypasses RLS, so no additional policies needed for the webhook.
-- But add policies so admins can also manage subscriptions if needed.
CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
