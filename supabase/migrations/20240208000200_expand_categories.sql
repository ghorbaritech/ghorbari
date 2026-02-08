-- Migration: Expand Categories with Types and Seed Specific Lists

-- 1. Create Category Type Enum
DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('product', 'service', 'design');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add type column to product_categories
ALTER TABLE public.product_categories 
ADD COLUMN IF NOT EXISTS type category_type DEFAULT 'product';

-- 3. Update existing categories to 'product' type
UPDATE public.product_categories SET type = 'product' WHERE type IS NULL;

-- 4. Fix Unique Constraints to allow same name across different types
ALTER TABLE public.product_categories DROP CONSTRAINT IF EXISTS product_categories_name_key;
ALTER TABLE public.product_categories DROP CONSTRAINT IF EXISTS product_categories_slug_key;
ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_name_type_key UNIQUE (name, type);
ALTER TABLE public.product_categories ADD CONSTRAINT product_categories_slug_type_key UNIQUE (slug, type);

-- 4. Seed expanded categories
-- Using ON CONFLICT to avoid duplicates if migration is rerun

-- PRODUCTS
INSERT INTO public.product_categories (name, slug, type) VALUES
('Sand', 'sand', 'product'),
('Brick', 'brick', 'product'),
('Steel', 'steel', 'product'),
('Rod', 'rod', 'product'),
('Electric', 'electric-product', 'product'),
('Plumbing', 'plumbing-product', 'product'),
('Tiles', 'tiles-product', 'product'),
('Sanitary', 'sanitary-product', 'product'),
('Wood', 'wood-product', 'product')
ON CONFLICT (slug, type) DO NOTHING;

-- SERVICES
INSERT INTO public.product_categories (name, slug, type) VALUES
('Electrical', 'electrical-service', 'service'),
('Plumbing', 'plumbing-service', 'service'),
('Wood', 'wood-service', 'service'),
('Paint', 'paint-service', 'service'),
('Construction', 'construction-service', 'service'),
('Tiles', 'tiles-service', 'service'),
('Sanitary', 'sanitary-service', 'service')
ON CONFLICT (slug, type) DO NOTHING;

-- DESIGNS
INSERT INTO public.product_categories (name, slug, type) VALUES
('Structural Design', 'structural-design', 'design'),
('Architectural Design', 'architectural-design', 'design'),
('Interior Design', 'interior-design', 'design')
ON CONFLICT (slug, type) DO NOTHING;

-- 5. Seed initial platform_configs overrides for these new categories 
-- (Optional: seed with defaults so they appear in the UI list)
INSERT INTO public.platform_configs (category_id, vat_rate, platform_fee_rate, advance_payment_rate)
SELECT id, 7.50, 2.00, 10.00 FROM public.product_categories
ON CONFLICT (category_id) DO NOTHING;
