-- Migration: Add Bengali Localization Fields
-- Description: Adds _bn columns to products, design_packages, service_packages, sellers, and designers.

-- 1. Products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS title_bn TEXT,
ADD COLUMN IF NOT EXISTS description_bn TEXT;

-- 2. Design Packages
ALTER TABLE public.design_packages
ADD COLUMN IF NOT EXISTS title_bn TEXT,
ADD COLUMN IF NOT EXISTS description_bn TEXT;

-- 3. Service Packages
ALTER TABLE public.service_packages
ADD COLUMN IF NOT EXISTS title_bn TEXT,
ADD COLUMN IF NOT EXISTS description_bn TEXT;

-- 4. Sellers
ALTER TABLE public.sellers
ADD COLUMN IF NOT EXISTS business_name_bn TEXT;

-- 5. Designers
ALTER TABLE public.designers
ADD COLUMN IF NOT EXISTS company_name_bn TEXT,
ADD COLUMN IF NOT EXISTS bio_bn TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.products.title_bn IS 'Bengali title for the product';
COMMENT ON COLUMN public.products.description_bn IS 'Bengali description for the product';
COMMENT ON COLUMN public.design_packages.title_bn IS 'Bengali title for the design package';
COMMENT ON COLUMN public.design_packages.description_bn IS 'Bengali description for the design package';
COMMENT ON COLUMN public.service_packages.title_bn IS 'Bengali title for the service package';
COMMENT ON COLUMN public.service_packages.description_bn IS 'Bengali description for the service package';
COMMENT ON COLUMN public.sellers.business_name_bn IS 'Bengali business name for the seller';
COMMENT ON COLUMN public.designers.company_name_bn IS 'Bengali company name for the designer';
COMMENT ON COLUMN public.designers.bio_bn IS 'Bengali bio for the designer';
