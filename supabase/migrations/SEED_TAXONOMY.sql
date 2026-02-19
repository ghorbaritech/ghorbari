-- SEED TAXONOMY (VISUAL CORRECTED)
-- Populates the product_categories table with exact structure from screenshots

-- Helper function to create category if not exists
CREATE OR REPLACE FUNCTION create_category(
    p_name TEXT, 
    p_slug TEXT, 
    p_type TEXT, 
    p_level INTEGER, 
    p_parent_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_parent_id UUID;
    v_cat_id UUID;
BEGIN
    -- Resolve parent ID if name provided
    IF p_parent_name IS NOT NULL THEN
        SELECT id INTO v_parent_id FROM product_categories WHERE name = p_parent_name AND level = p_level - 1 LIMIT 1;
    END IF;

    -- Find existing by slug OR name/type
    SELECT id INTO v_cat_id FROM product_categories 
    WHERE slug = p_slug 
       OR (name = p_name AND type = p_type::category_type)
    LIMIT 1;

    -- Upsert logic
    IF v_cat_id IS NOT NULL THEN
        -- Update existing
        UPDATE product_categories SET
            slug = p_slug, -- Ensure slug matches spec
            level = p_level,
            type = p_type::category_type, -- Should be same but update anyway
            parent_id = v_parent_id,
            metadata = p_metadata,
            is_active = true
        WHERE id = v_cat_id;
    ELSE
        -- Insert new
        INSERT INTO product_categories (name, slug, type, level, parent_id, metadata, is_active)
        VALUES (p_name, p_slug, p_type::category_type, p_level, v_parent_id, p_metadata, true)
        RETURNING id INTO v_cat_id;
    END IF;

    RETURN v_cat_id;
END;
$$ LANGUAGE plpgsql;

-- 1. Cement & Concrete
SELECT create_category('Cement & Concrete', 'cement-concrete', 'product', 0);

-- Sand
SELECT create_category('Sand', 'sand', 'product', 1, 'Cement & Concrete');
SELECT create_category('Sylhet Sand (Coarse / 2.5 FM)', 'sylhet-sand', 'product', 2, 'Sand', '{"unit": "CFT", "price": "48 - 70", "frequency": "Weekly", "brands": ["Local Private"]}'::jsonb);
SELECT create_category('Local Sand (Fine / 1.5 FM)', 'local-sand', 'product', 2, 'Sand', '{"unit": "CFT", "price": "18 - 25", "frequency": "Weekly", "brands": ["Local Private"]}'::jsonb);
SELECT create_category('Vitti Sand (Filling Sand)', 'vitti-sand', 'product', 2, 'Sand', '{"unit": "CFT", "price": "12 - 15", "frequency": "Weekly", "brands": ["Local Private"]}'::jsonb);

-- Cement
SELECT create_category('Cement', 'cement', 'product', 1, 'Cement & Concrete');
SELECT create_category('Portland Composite (PCC)', 'pcc-cement', 'product', 2, 'Cement', '{"unit": "Bag", "price": "510 - 535", "frequency": "Daily", "brands": ["Shah", "Seven Rings", "Fresh"]}'::jsonb);
SELECT create_category('Ordinary Portland (OPC)', 'opc-cement', 'product', 2, 'Cement', '{"unit": "Bag", "price": "545 - 585", "frequency": "Daily", "brands": ["Holcim", "Akij", "Bashundhara"]}'::jsonb);

-- Stone
SELECT create_category('Stone', 'stone', 'product', 1, 'Cement & Concrete');
SELECT create_category('Stone Chips (3/4")', 'stone-chips-3-4', 'product', 2, 'Stone', '{"unit": "CFT", "price": "185 - 215", "frequency": "Weekly", "brands": ["Bhutan / LC"]}'::jsonb);
SELECT create_category('Stone Chips (1/2")', 'stone-chips-1-2', 'product', 2, 'Stone', '{"unit": "CFT", "price": "175 - 205", "frequency": "Weekly", "brands": ["Bhutan / LC"]}'::jsonb);
SELECT create_category('Stone Chips (1/4")', 'stone-chips-1-4', 'product', 2, 'Stone', '{"unit": "CFT", "price": "165 - 195", "frequency": "Weekly", "brands": ["Bhutan / LC"]}'::jsonb);
SELECT create_category('Crushed Boulders', 'crushed-boulders', 'product', 2, 'Stone', '{"unit": "CFT", "price": "150 - 175", "frequency": "Weekly", "brands": ["Local / Imported"]}'::jsonb);

-- Mixture
SELECT create_category('Mixture', 'mixture', 'product', 1, 'Cement & Concrete');
SELECT create_category('Ready-Mix Concrete (RMC)', 'rmc', 'product', 2, 'Mixture', '{"unit": "CFT", "price": "280 - 360", "frequency": "Monthly", "brands": ["Mir", "Concord", "Bashundhara"]}'::jsonb);
SELECT create_category('Concrete Admixtures', 'admixtures', 'product', 2, 'Mixture', '{"unit": "Kg/L", "price": "140 - 350", "frequency": "Monthly", "brands": ["BASF", "Berger"]}'::jsonb);

-- Brick
SELECT create_category('Brick', 'brick', 'product', 1, 'Cement & Concrete');
SELECT create_category('1st Class Red Bricks', 'red-bricks', 'product', 2, 'Brick', '{"unit": "Piece", "price": "12 - 13", "frequency": "Weekly", "brands": ["Local Kiln"]}'::jsonb);
SELECT create_category('Auto Bricks (10-Hole)', 'auto-bricks', 'product', 2, 'Brick', '{"unit": "Piece", "price": "13.5 - 15", "frequency": "Weekly", "brands": ["Akij", "ABC", "Diamond"]}'::jsonb);
SELECT create_category('Hollow Blocks', 'hollow-blocks', 'product', 2, 'Brick', '{"unit": "Piece", "price": "35 - 75", "frequency": "Weekly", "brands": ["Mir", "Concord"]}'::jsonb);
SELECT create_category('Picket / Jhama Bricks', 'picket-bricks', 'product', 2, 'Brick', '{"unit": "Piece", "price": "11 - 12", "frequency": "Weekly", "brands": ["Local Kiln"]}'::jsonb);

-- 2. Steel & Metal
SELECT create_category('Steel & Metal', 'steel-metal', 'product', 0);

-- MS Rod
SELECT create_category('MS Rod', 'ms-rod', 'product', 1, 'Steel & Metal');
SELECT create_category('Grade 500W (8mm)', '500w-8mm', 'product', 2, 'MS Rod', '{"unit": "Ton", "price": "84,500", "frequency": "Daily", "brands": ["BSRM", "AKS", "KSRM"]}'::jsonb);
SELECT create_category('Grade 500W (10mm - 16mm)', '500w-10-16mm', 'product', 2, 'MS Rod', '{"unit": "Ton", "price": "82,500", "frequency": "Daily", "brands": ["BSRM", "AKS", "GPH"]}'::jsonb);
SELECT create_category('Grade 500W (20mm - 32mm)', '500w-20-32mm', 'product', 2, 'MS Rod', '{"unit": "Ton", "price": "83,500", "frequency": "Daily", "brands": ["BSRM", "KSRM"]}'::jsonb);
SELECT create_category('Grade 40/60 (Non-TMT)', 'grade-40-60', 'product', 2, 'MS Rod', '{"unit": "Ton", "price": "78,000", "frequency": "Daily", "brands": ["Local Brands"]}'::jsonb);

-- Structural
SELECT create_category('Structural', 'structural', 'product', 1, 'Steel & Metal');
SELECT create_category('MS Angle (1.5" - 3")', 'ms-angle', 'product', 2, 'Structural', '{"unit": "Ton", "price": "79,500", "frequency": "Daily", "brands": ["BSRM Xtrong", "PHP"]}'::jsonb);
SELECT create_category('MS Flat Bar', 'ms-flat-bar', 'product', 2, 'Structural', '{"unit": "Ton", "price": "80,000", "frequency": "Daily", "brands": ["PHP", "Steeltech"]}'::jsonb);
SELECT create_category('C-Channel / I-Beam', 'c-channel', 'product', 2, 'Structural', '{"unit": "Ton", "price": "82,500", "frequency": "Daily", "brands": ["BSRM", "Imported"]}'::jsonb);

-- Sheet Metal
SELECT create_category('Sheet Metal', 'sheet-metal', 'product', 1, 'Steel & Metal');
SELECT create_category('C.I. Sheet (Corrugated Tin)', 'ci-sheet', 'product', 2, 'Sheet Metal', '{"unit": "Bundle", "price": "5,200", "frequency": "Monthly", "brands": ["Cow Brand", "PHP"]}'::jsonb);
SELECT create_category('G.P. Sheet (Plain)', 'gp-sheet', 'product', 2, 'Sheet Metal', '{"unit": "Bundle", "price": "5,800", "frequency": "Monthly", "brands": ["Abul Khair", "PHP"]}'::jsonb);
SELECT create_category('Decking Sheet', 'decking-sheet', 'product', 2, 'Sheet Metal', '{"unit": "SFT", "price": "130", "frequency": "Monthly", "brands": ["Steeltech"]}'::jsonb);

-- Pipes
SELECT create_category('Pipes', 'pipes', 'product', 1, 'Steel & Metal');
SELECT create_category('MS Pipe (Black)', 'ms-pipe', 'product', 2, 'Pipes', '{"unit": "Rft", "price": "160", "frequency": "Monthly", "brands": ["BSRM", "RFL"]}'::jsonb);
SELECT create_category('GI Pipe (Galvanized)', 'gi-pipe', 'product', 2, 'Pipes', '{"unit": "Rft", "price": "210", "frequency": "Monthly", "brands": ["RFL", "National Poly"]}'::jsonb);

-- 3. Construction (Service)
SELECT create_category('Construction', 'construction-service', 'service', 0);

-- Structure
SELECT create_category('Structure', 'structure-service', 'service', 1, 'Construction');
SELECT create_category('Civil Labor (Full Building)', 'civil-labor', 'service', 2, 'Structure', '{"unit": "SFT", "price": "280 - 450"}'::jsonb);
SELECT create_category('RCC Casting Labor (Roof/Slab)', 'rcc-casting-labor', 'service', 2, 'Structure', '{"unit": "SFT", "price": "35 - 55"}'::jsonb);
SELECT create_category('Bricklaying Labor (5" Wall)', 'bricklaying-labor', 'service', 2, 'Structure', '{"unit": "SFT", "price": "12 - 18"}'::jsonb);
SELECT create_category('Plastering (Internal/External)', 'plastering', 'service', 2, 'Structure', '{"unit": "SFT", "price": "10 - 25"}'::jsonb);

-- Site Prep
SELECT create_category('Site Prep', 'site-prep-service', 'service', 1, 'Construction');
SELECT create_category('Soil Testing (3-5 Borings)', 'soil-testing', 'service', 2, 'Site Prep', '{"unit": "Project", "price": "15,000 - 25,000"}'::jsonb);
SELECT create_category('Pile Casting (Pre-cast/Cast-in-situ)', 'pile-casting', 'service', 2, 'Site Prep', '{"unit": "Rft", "price": "450 - 850"}'::jsonb);

-- 4. Electrical & Plumbing (Service)
SELECT create_category('Electrical & Plumbing', 'electrical-plumbing-service', 'service', 0);

-- Electrical
SELECT create_category('Electrical', 'electrical-service', 'service', 1, 'Electrical & Plumbing');
SELECT create_category('Point Wiring (Light/Fan)', 'point-wiring', 'service', 2, 'Electrical', '{"unit": "Point", "price": "250 - 450"}'::jsonb);
SELECT create_category('DB Box / Main Switch Install', 'db-box-install', 'service', 2, 'Electrical', '{"unit": "Job", "price": "1,500 - 3,500"}'::jsonb);
SELECT create_category('SDB Fitting & Breaker Setup', 'sdb-fitting', 'service', 2, 'Electrical', '{"unit": "Job", "price": "800 - 1,500"}'::jsonb);

-- Plumbing
SELECT create_category('Plumbing', 'plumbing-service', 'service', 1, 'Electrical & Plumbing');
SELECT create_category('Bathroom Pipe Fitting (Concealed)', 'bathroom-pipe-fitting', 'service', 2, 'Plumbing', '{"unit": "Bath", "price": "4,500 - 8,000"}'::jsonb);
SELECT create_category('Water Tank / Pump Installation', 'water-tank-install', 'service', 2, 'Plumbing', '{"unit": "Job", "price": "3,000 - 6,000"}'::jsonb);
SELECT create_category('Gas Line Fitting (Single Burner)', 'gas-line-fitting', 'service', 2, 'Plumbing', '{"unit": "Job", "price": "2,500 - 4,500"}'::jsonb);

-- 5. Tiles & Sanitary (Service)
SELECT create_category('Tiles & Sanitary', 'tiles-sanitary-service', 'service', 0);

-- Tiling
SELECT create_category('Tiling', 'tiling-service', 'service', 1, 'Tiles & Sanitary');
SELECT create_category('Floor Tiles Fitting (Labor)', 'floor-tiles-fitting', 'service', 2, 'Tiling', '{"unit": "SFT", "price": "45 - 65"}'::jsonb);
SELECT create_category('Wall Tiles Fitting (Kitchen/Bath)', 'wall-tiles-fitting', 'service', 2, 'Tiling', '{"unit": "SFT", "price": "50 - 75"}'::jsonb);
SELECT create_category('Marble/Granite Polishing', 'marble-polishing', 'service', 2, 'Tiling', '{"unit": "SFT", "price": "80 - 150"}'::jsonb);

-- Sanitary
SELECT create_category('Sanitary', 'sanitary-service', 'service', 1, 'Tiles & Sanitary');
SELECT create_category('Commode/Water Closet Install', 'commode-install', 'service', 2, 'Sanitary', '{"unit": "Piece", "price": "1,200 - 2,500"}'::jsonb);
SELECT create_category('Basin/Sink Installation', 'basin-install', 'service', 2, 'Sanitary', '{"unit": "Piece", "price": "800 - 1,500"}'::jsonb);
SELECT create_category('C.P. Fittings (Taps/Showers)', 'cp-fittings', 'service', 2, 'Sanitary', '{"unit": "Piece", "price": "250 - 500"}'::jsonb);

-- 6. Paint & Carpentry (Service)
SELECT create_category('Paint & Carpentry', 'paint-carpentry-service', 'service', 0);

-- Painting
SELECT create_category('Painting', 'painting-service', 'service', 1, 'Paint & Carpentry');
SELECT create_category('Plastic Emulsion (Labor Only)', 'plastic-emulsion-labor', 'service', 2, 'Painting', '{"unit": "SFT", "price": "10 - 15"}'::jsonb);
SELECT create_category('Weather Coat (Exterior Labor)', 'weather-coat-labor', 'service', 2, 'Painting', '{"unit": "SFT", "price": "12 - 22"}'::jsonb);
SELECT create_category('Wall Putty & Prep Work', 'wall-putty-labor', 'service', 2, 'Painting', '{"unit": "SFT", "price": "8 - 12"}'::jsonb);

-- Carpentry
SELECT create_category('Carpentry', 'carpentry-service', 'service', 1, 'Paint & Carpentry');
SELECT create_category('Door Frame (Chowkat) Install', 'door-frame-install', 'service', 2, 'Carpentry', '{"unit": "Piece", "price": "800 - 1,500"}'::jsonb);
SELECT create_category('Door Shutter Fitting (Hinges/Locks)', 'door-shutter-fitting', 'service', 2, 'Carpentry', '{"unit": "Piece", "price": "1,200 - 2,000"}'::jsonb);
SELECT create_category('Wardrobe/Cabinet Work (Board)', 'wardrobe-work', 'service', 2, 'Carpentry', '{"unit": "SFT", "price": "450 - 850"}'::jsonb);

-- Polish
SELECT create_category('Polish', 'polish-service', 'service', 1, 'Paint & Carpentry');
SELECT create_category('Wood Lacquer / High-Gloss Polish', 'wood-polish', 'service', 2, 'Polish', '{"unit": "SFT", "price": "150 - 350"}'::jsonb);

-- Clean up
DROP FUNCTION create_category;
