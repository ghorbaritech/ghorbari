-- Update Carpentry
UPDATE product_categories 
SET icon = '/categories/carpentry.svg'
WHERE name = 'Carpentry';

-- Update Tiles & Sanitary (reuse tiles.svg)
UPDATE product_categories 
SET icon = '/categories/tiles.svg'
WHERE name = 'Tiles & Sanitary';

-- Update Construction (use tools.svg)
UPDATE product_categories 
SET icon = '/categories/tools.svg'
WHERE name = 'Construction';

-- Update Structural (reuse steel.svg)
UPDATE product_categories 
SET icon = '/categories/steel.svg'
WHERE name = 'Structural';

-- Update others just in case they were missed
UPDATE product_categories SET icon = '/categories/cement.svg' WHERE name = 'Cement';
UPDATE product_categories SET icon = '/categories/sand.svg' WHERE name = 'Sand';
UPDATE product_categories SET icon = '/categories/brick.svg' WHERE name = 'Brick';
UPDATE product_categories SET icon = '/categories/cables.svg' WHERE name = 'Cables';
UPDATE product_categories SET icon = '/categories/stone.svg' WHERE name = 'Stone';
UPDATE product_categories SET icon = '/categories/pipe.svg' WHERE name = 'Pipes';
UPDATE product_categories SET icon = '/categories/steel.svg' WHERE name = 'MS Rod';
UPDATE product_categories SET icon = '/categories/paint.svg' WHERE name = 'Painting';
