
CREATE TABLE public.founding_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert founding members"
ON public.founding_members
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can count founding members"
ON public.founding_members
FOR SELECT
USING (true);
