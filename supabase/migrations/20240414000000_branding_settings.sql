-- 1. Create Branding Settings Table if not exists
CREATE TABLE IF NOT EXISTS public.branding_settings (
    id SERIAL PRIMARY KEY,
    logo_light_url TEXT, -- Use for dark backgrounds
    logo_dark_url TEXT,  -- Use for light backgrounds
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#f59e0b',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT singleton_branding CHECK (id = 1)
);

-- 2. Migration: Convert old logo_url to logo_dark_url if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branding_settings' AND column_name='logo_url') THEN
        UPDATE public.branding_settings SET logo_dark_url = logo_url WHERE logo_dark_url IS NULL;
        ALTER TABLE public.branding_settings DROP COLUMN IF EXISTS logo_url;
    END IF;
END $$;

-- 3. Insert Initial Row if not exists
INSERT INTO public.branding_settings (id, logo_dark_url, logo_light_url, primary_color)
VALUES (1, '/logo-dalankotha-white-bg.png', '/logo-dalankotha-white-bg.png', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- 4. RLS Policies
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view branding" ON public.branding_settings;
CREATE POLICY "Anyone can view branding" ON public.branding_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update branding" ON public.branding_settings;
CREATE POLICY "Admins can update branding" ON public.branding_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 5. Storage Bucket Configuration (Automated)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
CREATE POLICY "Branding Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Branding Admin Access" ON storage.objects;
CREATE POLICY "Branding Admin Access" ON storage.objects 
    FOR ALL USING (
        bucket_id = 'brand-assets' AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
