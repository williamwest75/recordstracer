
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Investigations table
CREATE TABLE public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investigations" ON public.investigations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investigations" ON public.investigations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investigations" ON public.investigations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investigations" ON public.investigations FOR DELETE USING (auth.uid() = user_id);

-- Searches table
CREATE TABLE public.searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own searches" ON public.searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own searches" ON public.searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own searches" ON public.searches FOR DELETE USING (auth.uid() = user_id);

-- Saved results table
CREATE TABLE public.saved_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_id UUID REFERENCES public.searches(id) ON DELETE CASCADE,
  investigation_id UUID REFERENCES public.investigations(id) ON DELETE SET NULL,
  result_data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved results" ON public.saved_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved results" ON public.saved_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved results" ON public.saved_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved results" ON public.saved_results FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON public.investigations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
