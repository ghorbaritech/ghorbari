-- Migration: Add Admin RLS Policies for product-images and category_images
-- Description: Ensures storage buckets exist and grants full CRUD access to administrators.

-- 1. Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('category_images', 'category_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLICIES FOR product-images
DROP POLICY IF EXISTS "Public Read Access for product-images" ON storage.objects;
CREATE POLICY "Public Read Access for product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin CRUD for product-images" ON storage.objects;
CREATE POLICY "Admin CRUD for product-images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'product-images'
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
    bucket_id = 'product-images'
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- 3. POLICIES FOR category_images
DROP POLICY IF EXISTS "Public Read Access for category_images" ON storage.objects;
CREATE POLICY "Public Read Access for category_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category_images');

DROP POLICY IF EXISTS "Admin CRUD for category_images" ON storage.objects;
CREATE POLICY "Admin CRUD for category_images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'category_images'
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
    bucket_id = 'category_images'
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
