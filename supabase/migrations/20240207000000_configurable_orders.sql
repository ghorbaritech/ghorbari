-- Migration: Configurable Orders and Admin Flow

-- 1. Create Platform Configurations Table
CREATE TABLE IF NOT EXISTS public.platform_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE, -- Null means global/default
    vat_rate DECIMAL(5,2) DEFAULT 7.50,
    platform_fee_rate DECIMAL(5,2) DEFAULT 2.00,
    advance_payment_rate DECIMAL(5,2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id)
);

-- 2. Add Statuses to order_status if not exists
-- Note: In Supabase/PostgreSQL, you can't easily ALTER TYPE for items. 
-- We'll check if we need to add a new column or just use text if enum is restrictive.
-- For now, let's add columns to orders to handle the transition logic.

-- 3. Enhance Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id);

-- 4. Enable RLS on platform_configs
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active configs" ON public.platform_configs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage configs" ON public.platform_configs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Insert initial global config
INSERT INTO public.platform_configs (category_id, vat_rate, platform_fee_rate, advance_payment_rate)
VALUES (NULL, 7.50, 2.00, 10.00)
ON CONFLICT (category_id) DO NOTHING;
