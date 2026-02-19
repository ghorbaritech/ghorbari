-- Migration: Add Bangla Name Column to Product Categories
-- Description: Adds a 'name_bn' column to support Bengali localization for categories, subcategories, and items.

ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS name_bn TEXT;

-- Optional: Add a comment
COMMENT ON COLUMN public.product_categories.name_bn IS 'Bengali display name for the category';
