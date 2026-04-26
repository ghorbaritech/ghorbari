-- Migration: Storage Setup
-- Description: Initializes storage buckets and sets up RLS policies.

-- 1. INITIALIZE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('brand-assets', 'brand-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon']),
    ('partner-documents', 'partner-documents', false, 10485760, ARRAY['image/png', 'image/jpeg', 'application/pdf']),
    ('design_assets', 'design_assets', false, 20971520, ARRAY['image/png', 'image/jpeg', 'application/pdf', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- 2. POLICIES FOR brand-assets (Public)
DROP POLICY IF EXISTS "Public Read Access for brand-assets" ON storage.objects;
CREATE POLICY "Public Read Access for brand-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Admin CRUD for brand-assets" ON storage.objects;
CREATE POLICY "Admin CRUD for brand-assets"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'brand-assets' 
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
    bucket_id = 'brand-assets' 
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- 3. POLICIES FOR partner-documents (Private)
DROP POLICY IF EXISTS "Users can upload own partner documents" ON storage.objects;
CREATE POLICY "Users can upload own partner documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'partner-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view own partner documents" ON storage.objects;
CREATE POLICY "Users can view own partner documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'partner-documents' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
);

-- 4. POLICIES FOR design_assets (Private)
DROP POLICY IF EXISTS "Users can upload design assets" ON storage.objects;
CREATE POLICY "Users can upload design assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'design_assets'
);

DROP POLICY IF EXISTS "Access control for design assets" ON storage.objects;
CREATE POLICY "Access control for design assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'design_assets'
    AND (
        (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
        OR owner = auth.uid()
    )
);
