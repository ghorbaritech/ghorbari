-- Seed Icons for Categories
-- Updates existing categories with appropriate Lucide icon names

-- Helper function to safe update
CREATE OR REPLACE FUNCTION update_category_icon(p_slug TEXT, p_icon TEXT) 
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_categories 
    SET icon = p_icon 
    WHERE slug = p_slug;
END;
$$ LANGUAGE plpgsql;

-- ROOT PRODUCTS
SELECT update_category_icon('cement-concrete', 'BrickWall');
SELECT update_category_icon('steel-metal', 'Anvil');
SELECT update_category_icon('electrical-plumbing', 'Zap');
SELECT update_category_icon('tiles-sanitary', 'Grid3x3');
SELECT update_category_icon('paint-finishes', 'PaintBucket');

-- PRODUCT SUBCATEGORIES
-- Cement
SELECT update_category_icon('sand', 'MountainSnow'); -- Closest to sand pile
SELECT update_category_icon('cement', 'Package');
SELECT update_category_icon('stone', 'Gem');
SELECT update_category_icon('mixture', 'FlaskConical'); -- Chemical/Mix
SELECT update_category_icon('brick', 'BrickWall');

-- Steel
SELECT update_category_icon('ms-rod', 'Construction');
SELECT update_category_icon('structural', 'Ruler');
SELECT update_category_icon('sheet-metal', 'Sheet');
SELECT update_category_icon('pipes', 'Cylinder');
SELECT update_category_icon('wire-mesh', 'Grid');

-- Electrical & Plumbing (Product)
SELECT update_category_icon('cables', 'Cable');
SELECT update_category_icon('fittings', 'Plug');
SELECT update_category_icon('plumbing-product', 'Droplets');
SELECT update_category_icon('storage', 'Database'); -- Tank looks like DB

-- Tiles (Product)
SELECT update_category_icon('floor-tiles', 'Layers');
SELECT update_category_icon('wall-tiles', 'LayoutGrid');
SELECT update_category_icon('sanitary-product', 'Bath');
SELECT update_category_icon('fittings-sanitary', 'ShowerHead');

-- Paint (Product)
SELECT update_category_icon('interior', 'Home');
SELECT update_category_icon('exterior', 'Sun');
SELECT update_category_icon('prep', 'Eraser');
SELECT update_category_icon('treatment', 'ShieldAlert');

-- ROOT SERVICES
SELECT update_category_icon('construction-service', 'HardHat');
SELECT update_category_icon('electrical-plumbing-service', 'Wrench');
SELECT update_category_icon('tiles-sanitary-service', 'Hammer');
SELECT update_category_icon('paint-carpentry', 'Brush');

-- SERVICE SUBCATEGORIES
-- Construction
SELECT update_category_icon('structure', 'Building2');
SELECT update_category_icon('site-prep', 'Shovel');

-- Electrical & Plumbing (Service)
SELECT update_category_icon('electrical-service', 'Zap');
SELECT update_category_icon('plumbing-service', 'Wrench');

-- Tiles (Service)
SELECT update_category_icon('tiling', 'Grid3x3');
SELECT update_category_icon('sanitary-service', 'Bath');

-- Paint & Carpentry
SELECT update_category_icon('painting', 'Paintbrush');
SELECT update_category_icon('carpentry', 'Axe'); -- or Hammer
SELECT update_category_icon('polish', 'Sparkles');

-- Cleanup function
DROP FUNCTION update_category_icon(TEXT, TEXT);
