-- Migration: Ghorbari LegalSign Initialization
-- Description: Sets up tables and RLS for electronic contracts and signatures.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE contract_status AS ENUM ('DRAFT', 'SIGN_PENDING', 'SIGNED', 'EXPIRED', 'REVOKED');
    END IF;
END $$;

-- 1. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    contract_type TEXT NOT NULL DEFAULT 'PARTNER_ONBOARDING',
    status contract_status DEFAULT 'DRAFT',
    variable_data JSONB NOT NULL DEFAULT '{}',
    pdf_url TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONTRACT SIGNATURES TABLE
CREATE TABLE IF NOT EXISTS public.contract_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signature_svg TEXT NOT NULL, -- Visual SVG path data
    ip_address TEXT,
    user_agent TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Policies for public.contracts
CREATE POLICY "Admins have full access to contracts" 
    ON public.contracts FOR ALL 
    USING (public.is_admin());

CREATE POLICY "Partners can view their own contracts" 
    ON public.contracts FOR SELECT 
    USING (auth.uid() = partner_id);

CREATE POLICY "Partners can update their own contracts during signing" 
    ON public.contracts FOR UPDATE 
    USING (auth.uid() = partner_id)
    WITH CHECK (auth.uid() = partner_id AND status = 'SIGN_PENDING');

-- Policies for public.contract_signatures
CREATE POLICY "Admins can view all signatures" 
    ON public.contract_signatures FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Users can view their own signatures" 
    ON public.contract_signatures FOR SELECT 
    USING (auth.uid() = signer_id);

CREATE POLICY "Users can insert their own signatures" 
    ON public.contract_signatures FOR INSERT 
    WITH CHECK (auth.uid() = signer_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_signatures;
