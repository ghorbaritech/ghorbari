-- ==========================================
-- FINAL GHORBARI PLATFORM FIXES
-- Phases 1, 4, & 5 (AI, Configs, & Actions)
-- ==========================================

-- 1. AI PERSISTENCE (Phase 1)
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for AI Tables
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own AI sessions" ON public.ai_sessions;
CREATE POLICY "Users can manage own AI sessions" ON public.ai_sessions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own AI messages" ON public.ai_messages;
CREATE POLICY "Users can manage own AI messages" ON public.ai_messages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.ai_sessions WHERE id = session_id AND user_id = auth.uid())
    );

-- 2. PRODUCT CATEGORIES (Standardizing Types)
-- This ensures the 'type' column exists for the Platform Config join
DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('product', 'service', 'design');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.product_categories 
ADD COLUMN IF NOT EXISTS type category_type DEFAULT 'product';

UPDATE public.product_categories SET type = 'product' WHERE type IS NULL;

-- Fix unique constraints to allow same name across types (e.g., 'Tiles' as product and service)
-- DEDUPLICATION step: If there are existing duplicates, keep the one with the most dependencies (links to products/configs) or just the first one.
DELETE FROM public.product_categories pc1
USING public.product_categories pc2
WHERE pc1.id > pc2.id 
  AND pc1.name = pc2.name 
  AND pc1.type = pc2.type;

ALTER TABLE public.product_categories DROP CONSTRAINT IF EXISTS product_categories_name_key;
ALTER TABLE public.product_categories DROP CONSTRAINT IF EXISTS product_categories_slug_key;
DROP INDEX IF EXISTS product_categories_name_key;
DROP INDEX IF EXISTS product_categories_slug_key;

-- Add composite unique constraints
DO $$ BEGIN
    ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_name_type_key UNIQUE (name, type);
    ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_slug_type_key UNIQUE (slug, type);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PLATFORM CONFIGURATIONS (Phase 5 Logic)
-- Used for VAT, Fees, and Advance Payment calculations
CREATE TABLE IF NOT EXISTS public.platform_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
    vat_rate DECIMAL(5,2) DEFAULT 7.50,
    platform_fee_rate DECIMAL(5,2) DEFAULT 2.00,
    advance_payment_rate DECIMAL(5,2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id)
);

-- RLS for Platform Configs
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read platform configs" ON public.platform_configs;
CREATE POLICY "Public read platform configs" ON public.platform_configs
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage platform configs" ON public.platform_configs;
CREATE POLICY "Admins manage platform configs" ON public.platform_configs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. SEED INITIAL GLOBAL CONFIG
INSERT INTO public.platform_configs (category_id, vat_rate, platform_fee_rate, advance_payment_rate)
VALUES (NULL, 7.50, 2.00, 10.00)
ON CONFLICT (category_id) DO NOTHING;

-- 5. STORAGE BUCKETS (Phase 4)
-- This must be done in Supabase Dashboard, but these are the requirements:
-- Bucket Name: 'ai-uploads'
-- Public: Yes
-- RLS: Enabled (Public read, Authenticated upload)
