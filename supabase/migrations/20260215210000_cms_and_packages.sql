-- Migration: CMS Gaps and Service/Design Packages

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
CREATE TRIGGER update_home_content_modtime 
BEFORE UPDATE ON public.home_content 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_service_packages_modtime 
BEFORE UPDATE ON public.service_packages 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_design_packages_modtime 
BEFORE UPDATE ON public.design_packages 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
