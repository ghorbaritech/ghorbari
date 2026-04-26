-- Update categories with colorful icon paths
UPDATE product_categories SET icon = '/categories/brick.svg' WHERE name ILIKE '%Brick%';
UPDATE product_categories SET icon = '/categories/cement.svg' WHERE name ILIKE '%Cement%';
UPDATE product_categories SET icon = '/categories/sand.svg' WHERE name ILIKE '%Sand%';
UPDATE product_categories SET icon = '/categories/steel.svg' WHERE name ILIKE '%Steel%' OR name ILIKE '%Rod%';
UPDATE product_categories SET icon = '/categories/paint.svg' WHERE name ILIKE '%Paint%' OR name ILIKE '%Finish%';
UPDATE product_categories SET icon = '/categories/tiles.svg' WHERE name ILIKE '%Tile%';
UPDATE product_categories SET icon = '/categories/cables.svg' WHERE name ILIKE '%Electric%' OR name ILIKE '%Cable%' OR name ILIKE '%Wire%';
UPDATE product_categories SET icon = '/categories/pipe.svg' WHERE name ILIKE '%Pipe%' OR name ILIKE '%Plumb%';
UPDATE product_categories SET icon = '/categories/stone.svg' WHERE name ILIKE '%Stone%';
