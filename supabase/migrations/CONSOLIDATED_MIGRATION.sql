-- CONSOLIDATED MIGRATION
-- Run this in your Supabase SQL Editor to apply all missing schema changes.

-- ==========================================
-- PART 1: CMS & PACKAGES
-- ==========================================

-- 1. Home Page Content CMS
CREATE TABLE IF NOT EXISTS public.home_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL, -- 'hero_banner', 'featured_categories', 'promotional_banner'
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Service Packages (Specific offerings by Service Providers)
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.product_categories(id), -- Optional, for filtering
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 'job', -- 'sqft', 'hour', 'job'
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Design Packages (Specific offerings by Designers)
CREATE TABLE IF NOT EXISTS public.design_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.product_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 'sqft', -- 'sqft', 'room', 'consultation'
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_packages ENABLE ROW LEVEL SECURITY;

-- Home Content Policies
CREATE POLICY "Public view active home content" ON public.home_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage home content" ON public.home_content
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Service Packages Policies
CREATE POLICY "Public view active service packages" ON public.service_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers manage own service packages" ON public.service_packages
    FOR ALL USING (
        provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid())
    );

-- Design Packages Policies
CREATE POLICY "Public view active design packages" ON public.design_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Designers manage own design packages" ON public.design_packages
    FOR ALL USING (
        designer_id IN (SELECT id FROM public.designers WHERE user_id = auth.uid())
    );

-- 5. Triggers for updated_at
-- Note: update_updated_at_column() function must exist (usually from initial schema)
DROP TRIGGER IF EXISTS update_home_content_modtime ON public.home_content;
CREATE TRIGGER update_home_content_modtime 
BEFORE UPDATE ON public.home_content 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_packages_modtime ON public.service_packages;
CREATE TRIGGER update_service_packages_modtime 
BEFORE UPDATE ON public.service_packages 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_packages_modtime ON public.design_packages;
CREATE TRIGGER update_design_packages_modtime 
BEFORE UPDATE ON public.design_packages 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ==========================================
-- PART 2: REVIEWS & RATINGS
-- ==========================================

-- 1. Create Unified Reviews Table
DO $$ BEGIN
    CREATE TYPE review_target_type AS ENUM ('product', 'service_package', 'design_package', 'seller', 'service_provider', 'designer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
    target_type review_target_type NOT NULL,
    target_id UUID NOT NULL, -- The ID of the product, package, or partner
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can updated own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can delete reviews" ON public.reviews
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_modtime ON public.reviews;
CREATE TRIGGER update_reviews_modtime 
BEFORE UPDATE ON public.reviews 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
