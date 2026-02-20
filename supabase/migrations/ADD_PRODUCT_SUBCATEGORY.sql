-- Add sub_category field to products table
-- This stores a specific label like "Cement", "Sand", "Bricks", "MS Rod", etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category);
