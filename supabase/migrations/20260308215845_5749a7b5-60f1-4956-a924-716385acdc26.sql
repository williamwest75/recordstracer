
CREATE TABLE public.records_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_name TEXT NOT NULL,
  state TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'sunshine',
  agency_name TEXT,
  agency_email TEXT,
  records_description TEXT,
  requester_name TEXT,
  requester_email TEXT,
  requester_org TEXT,
  filed_date TIMESTAMP WITH TIME ZONE,
  legal_deadline TIMESTAMP WITH TIME ZONE,
  custom_reminder_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  letter_text TEXT,
  reminder_day3_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_day10_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_day20_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_day30_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_custom_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.records_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.records_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON public.records_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.records_requests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON public.records_requests FOR DELETE USING (auth.uid() = user_id);
