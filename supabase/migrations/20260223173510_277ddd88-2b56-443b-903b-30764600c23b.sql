
-- 1. founding_members: restrict INSERT to edge function only (via service role), block public insert
DROP POLICY IF EXISTS "Anyone can insert founding members" ON public.founding_members;
CREATE POLICY "No public insert founding members" ON public.founding_members FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No public update founding members" ON public.founding_members FOR UPDATE USING (false);
CREATE POLICY "No public delete founding members" ON public.founding_members FOR DELETE USING (false);

-- 2. news_subscribers: add admin-only SELECT, block UPDATE/DELETE
CREATE POLICY "Admins can read subscribers" ON public.news_subscribers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "No public update subscribers" ON public.news_subscribers FOR UPDATE USING (false);
CREATE POLICY "No public delete subscribers" ON public.news_subscribers FOR DELETE USING (false);

-- 3. searches: add UPDATE policy
CREATE POLICY "Users can update own searches" ON public.searches FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. user_roles: admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. news_posts: admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert posts" ON public.news_posts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update posts" ON public.news_posts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete posts" ON public.news_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. founding_member_rate_limits: block UPDATE/DELETE
CREATE POLICY "No public update rate limits" ON public.founding_member_rate_limits FOR UPDATE USING (false);
CREATE POLICY "No public delete rate limits" ON public.founding_member_rate_limits FOR DELETE USING (false);
