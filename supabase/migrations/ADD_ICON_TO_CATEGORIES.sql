-- Migration: Add Icon Column for Lucide Icon Names

-- 1. Add icon column to product_categories
ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS icon TEXT; -- Stores Lucide icon name (e.g. 'Hammer', 'Zap')

-- 2. Index for performance (optional but good practice)
-- CREATE INDEX IF NOT EXISTS idx_product_categories_icon ON public.product_categories(icon);
