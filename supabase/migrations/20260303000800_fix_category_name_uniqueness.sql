-- Migration: Fix category unique constraint
-- Replace UNIQUE(name, type) with UNIQUE(name, type, parent_id)
-- This allows the same sub-item name under different parents (identified by tree path)

-- Step 1: Drop the old constraint that blocks same name across different parents
ALTER TABLE product_categories 
DROP CONSTRAINT IF EXISTS product_categories_name_type_key;

-- Step 2: Add new constraint — same name is only blocked within the SAME parent
-- NULLS NOT DISTINCT means two root categories (parent_id IS NULL) with same name+type still conflict
ALTER TABLE product_categories 
ADD CONSTRAINT product_categories_name_type_parent_key 
UNIQUE NULLS NOT DISTINCT (name, type, parent_id);
