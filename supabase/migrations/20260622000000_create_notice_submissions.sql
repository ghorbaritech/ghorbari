-- Migration: Create notice_submissions table and setup RLS policies

CREATE TABLE IF NOT EXISTS public.notice_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notice_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (since customers submit this form)
CREATE POLICY "Anyone can submit notices" ON public.notice_submissions
    FOR INSERT WITH CHECK (true);

-- Allow admins to read/manage submissions
CREATE POLICY "Admins manage notice submissions" ON public.notice_submissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
