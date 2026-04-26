-- FIX CORE SYSTEM ISSUES
-- 1. Profiles RLS (Crucial for Dashboard Layout to detect role)
-- 2. Platform Configs (Crucial for App Settings)

-- ==========================================
-- 1. FIX PROFILES RLS
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile (Standard)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- CRITICAL: Allow reading roles for layout logic? 
-- Actually, the layout uses `supabase.auth.getUser()` then queries `profiles`.
-- The "Users can view own profile" policy ABOVE is sufficient for `dashboard/layout.tsx` 
-- because it queries BY ID (`eq('id', user.id)`).

-- ==========================================
-- 2. FIX PLATFORM CONFIGS
-- ==========================================
-- Ensure table exists matching the TypeScript interface
CREATE TABLE IF NOT EXISTS public.platform_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id), -- Nullable for global defaults
    vat_rate DECIMAL(5,2) DEFAULT 0,
    platform_fee_rate DECIMAL(5,2) DEFAULT 0,
    advance_payment_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id) -- Prevent duplicate configs for same category (use NULL for global)
);

-- RLS for Platform Configs
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE (Authenticated or not) to READ platform configs 
-- (Needed for cart calculation, signup, etc.)
DROP POLICY IF EXISTS "Public read platform configs" ON public.platform_configs;
CREATE POLICY "Public read platform configs" ON public.platform_configs
    FOR SELECT USING (true);

-- Allow ADMIM only to modify
DROP POLICY IF EXISTS "Admins manage platform configs" ON public.platform_configs;
CREATE POLICY "Admins manage platform configs" ON public.platform_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ==========================================
-- 3. SEED DEFAULT CONFIG (If missing)
-- ==========================================
INSERT INTO public.platform_configs (category_id, vat_rate, platform_fee_rate, advance_payment_rate, is_active)
SELECT NULL, 5.0, 10.0, 20.0, true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_configs WHERE category_id IS NULL);

-- ==========================================
-- 4. FIX PRODUCT CATEGORIES (Read Access)
-- ==========================================
-- The config query joins 'product_categories', so we need read access there too.
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON public.product_categories;
CREATE POLICY "Public read categories" ON public.product_categories
    FOR SELECT USING (true);
