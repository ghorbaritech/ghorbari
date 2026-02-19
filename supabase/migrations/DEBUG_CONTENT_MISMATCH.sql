-- Check home_content for featured_categories
SELECT * FROM home_content WHERE section_key = 'featured_categories';

-- Check a few product categories to see icon data
SELECT id, name, icon FROM product_categories LIMIT 5;
