-- TAXONOMY MIGRATION
-- Updates product_categories to support 3-level hierarchy and metadata

-- 1. Add new columns to product_categories
ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0, -- 0=Root, 1=Sub, 2=Item
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb, -- Stores unit, avg_price, brands
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'product', -- 'product', 'service', 'design'
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Update existing rows (Optional cleanup)
-- Ensure root categories have level 0
UPDATE public.product_categories SET level = 0 WHERE parent_id IS NULL;

-- 3. Create indexes for performance and constraints
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_section ON public.product_categories(section);

-- Ensure slug is unique for ON CONFLICT to work
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);
