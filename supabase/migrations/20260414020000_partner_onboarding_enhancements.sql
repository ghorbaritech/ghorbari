-- Migration: Partner Onboarding Enhancements
-- Description: Adds fields for NID OCR, Trade License, and Verification status.

-- 1. ADD COLUMNS TO PROFILES (Shared core identity data)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nid_number TEXT,
ADD COLUMN IF NOT EXISTS nid_front_url TEXT,
ADD COLUMN IF NOT EXISTS nid_back_url TEXT,
ADD COLUMN IF NOT EXISTS nid_full_name TEXT,
ADD COLUMN IF NOT EXISTS nid_dob DATE,
ADD COLUMN IF NOT EXISTS trade_license_url TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 2. CREATE VERIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- 'OCR_PARSED', 'APPROVED', 'REJECTED', 'DOC_UPLOAD'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS FOR LOGS
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" 
    ON public.verification_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own logs" 
    ON public.verification_logs FOR SELECT 
    USING (auth.uid() = profile_id);

-- 4. STORAGE BUCKETS (Note: Metadata only, actual bucket creation usually via UI or CLI)
-- Ensuring we have a reference for developers.
-- Buckets needed: 'partner-documents' (Private)

-- 5. FUNCTION TO NOTIFY ON VERIFICATION REQUEST
CREATE OR REPLACE FUNCTION notify_admin_on_partner_request()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.onboarding_step = 4 AND OLD.onboarding_step < 4) THEN
        INSERT INTO public.notifications (user_id, title, message, link)
        SELECT id, 'Partner Verification Pending', 
               'A new partner application requires document review.', 
               '/admin/users?tab=partners'
        FROM public.profiles 
        WHERE role = 'admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_partner_onboarding_finalized
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (NEW.onboarding_step = 4 AND OLD.onboarding_step < 4)
    EXECUTE FUNCTION notify_admin_on_partner_request();
