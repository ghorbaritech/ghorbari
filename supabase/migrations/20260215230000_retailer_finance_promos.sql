-- Migration: Retailer Finance and Campaigns

-- 1. Seller Ledger (Commission Tracking)
CREATE TABLE IF NOT EXISTS public.seller_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- Positive for due/charge, Negative for payment/credit
    type TEXT NOT NULL, -- 'commission_charge', 'payment_cleared', 'adjustment'
    description TEXT,
    reference_id UUID, -- order_id or payment_ref
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns (Promos & Coupons)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    code TEXT NOT NULL, -- e.g. SUMMER20
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, code)
);

-- 3. Enable RLS
ALTER TABLE public.seller_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Ledger Policies
CREATE POLICY "Sellers view own ledger" ON public.seller_ledger
    FOR SELECT USING (
        seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins manage ledger" ON public.seller_ledger
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Campaign Policies
CREATE POLICY "Sellers manage own campaigns" ON public.campaigns
    FOR ALL USING (
        seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    );

CREATE POLICY "Public view active campaigns" ON public.campaigns
    FOR SELECT USING (is_active = true AND end_date > NOW());

-- 4. Trigger for updated_at
CREATE TRIGGER update_campaigns_modtime 
BEFORE UPDATE ON public.campaigns 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
