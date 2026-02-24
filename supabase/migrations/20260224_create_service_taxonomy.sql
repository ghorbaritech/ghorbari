-- Migration: Create Service Taxonomy (3-Level Hierarchy) - CORRECTED LEVELS
-- Structure: Root Category (Level 0) > Subcategory (Level 1) > Item (Level 2)
-- This script uses ON CONFLICT to handle cases where categories might already exist.

DO $$
DECLARE
    -- Root IDs
    v_root_paint UUID;
    v_root_carpentry UUID;
    v_root_aluminium UUID;
    v_root_construction UUID;
    
    -- Subcategory IDs
    v_sub_interior_paint UUID;
    v_sub_enamel_paint UUID;
    v_sub_damp_repair UUID;
    v_sub_wood_paint UUID;
    
    v_sub_furn_repair UUID;
    v_sub_furn_new UUID;
    v_sub_furn_assemble UUID;
    v_sub_furn_cover UUID;
    
    v_sub_thai_glass UUID;
    v_sub_glass_works UUID;
    v_sub_mosquito_net UUID;
    v_sub_lock_service UUID;
    
    v_sub_tiles_fitting UUID;
    v_sub_construction_generic UUID;
    v_sub_false_ceiling UUID;

BEGIN
    -- ==========================================
    -- 1. PAINT SERVICE HIERARCHY (Level 0)
    -- ==========================================
    INSERT INTO public.product_categories (name, name_bn, slug, type, level, section, is_active)
    VALUES ('Paint Service', 'রং পরিষেবা', 'paint-service', 'service', 0, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_root_paint;

    -- Subcategories for Paint (Level 1)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Interior Paint', 'অভ্যন্তরীণ রং', 'interior-paint', 'service', v_root_paint, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_interior_paint;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Enamel Paint', 'এনামেল রং', 'enamel-paint', 'service', v_root_paint, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_enamel_paint;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Damp Repair', 'ড্যাম্প মেরামত', 'damp-repair', 'service', v_root_paint, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_damp_repair;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Wood & Furniture Paint', 'কাঠ ও ফার্নিচার রং', 'wood-furniture-paint', 'service', v_root_paint, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_wood_paint;

    -- Items for Interior Paint (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Plastic Paint', 'প্লাস্টিক পেইন্ট', 'plastic-paint', 'service', v_sub_interior_paint, 2, 'product', true),
    ('Distemper Paint', 'ডিস্টেম্পার পেইন্ট', 'distemper-paint', 'service', v_sub_interior_paint, 2, 'product', true),
    ('Luxury Silk Paint', 'লাক্সারি সিল্ক পেইন্ট', 'luxury-silk-paint', 'service', v_sub_interior_paint, 2, 'product', true),
    ('Breath Easy/Easy Clean', 'ব্রিদ ইজি/ইজি ক্লিন', 'breath-easy-clean', 'service', v_sub_interior_paint, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Enamel Paint (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('New Surface', 'নতুন সারফেস', 'enamel-new-surface', 'service', v_sub_enamel_paint, 2, 'product', true),
    ('Re-Paint Old Surface', 'পুরাতন সারফেস পুনঃরং', 'enamel-repaint', 'service', v_sub_enamel_paint, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Damp Repair (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Damp Wall Repair Permanent', 'ড্যাম্প ওয়াল স্থায়ী মেরামত', 'damp-wall-repair-permanent', 'service', v_sub_damp_repair, 2, 'product', true),
    ('Roof Water Leakage Repair', 'ছাদের পানি লিকেজ মেরামত', 'roof-water-leakage-repair', 'service', v_sub_damp_repair, 2, 'product', true),
    ('Damp wall Treatment Temporary', 'ড্যাম্প ওয়াল অস্থায়ী ট্রিটমেন্ট', 'damp-wall-treatment-temporary', 'service', v_sub_damp_repair, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Wood & Furniture Paint (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Lacquar Varnish', 'ল্যাকার বার্নিশ', 'lacquar-varnish', 'service', v_sub_wood_paint, 2, 'product', true),
    ('Hand Polish (Varnish Paint)', 'হ্যান্ড পালিশ (বার্নিশ পেইন্ট)', 'hand-polish-varnish', 'service', v_sub_wood_paint, 2, 'product', true),
    ('Spray or Deco paint', 'স্প্রে বা ডেকো পেইন্ট', 'spray-deco-paint', 'service', v_sub_wood_paint, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;


    -- ==========================================
    -- 2. CARPENTRY SERVICES HIERARCHY (Level 0)
    -- ==========================================
    INSERT INTO public.product_categories (name, name_bn, slug, type, level, section, is_active)
    VALUES ('Carpentry Services', 'ছুতার পরিষেবা', 'carpentry-services', 'service', 0, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_root_carpentry;

    -- Subcategories for Carpentry (Level 1)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Furniture Repair & Fixes', 'ফার্নিচার মেরামত ও ঠিক করা', 'furniture-repair-fixes', 'service', v_root_carpentry, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_furn_repair;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('New Furniture', 'নতুন ফার্নিচার', 'new-furniture-sub', 'service', v_root_carpentry, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_furn_new;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Furniture Assemble & Fitting', 'ফার্নিচার অ্যাসেম্বল ও ফিটিং', 'furniture-assemble-fitting', 'service', v_root_carpentry, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_furn_assemble;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Furniture Cover & Foam Repair', 'ফার্নিচার কভার ও ফোম মেরামত', 'furniture-cover-foam-repair-sub', 'service', v_root_carpentry, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_furn_cover;

    -- Items for Furniture Repair & Fixes (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Up to 2 Hour', '২ ঘণ্টা পর্যন্ত', 'furniture-repair-2h', 'service', v_sub_furn_repair, 2, 'product', true),
    ('3 Hour to 5 Hour', '৩ থেকে ৫ ঘণ্টা', 'furniture-repair-5h', 'service', v_sub_furn_repair, 2, 'product', true),
    ('6 Hour to 8 Hour', '৬ থেকে ৮ ঘণ্টা', 'furniture-repair-8h', 'service', v_sub_furn_repair, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for New Furniture (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Catalog Design', 'ক্যাটালগ ডিজাইন', 'furniture-catalog-design', 'service', v_sub_furn_new, 2, 'product', true),
    ('Customized Design', 'কাস্টমাইজড ডিজাইন', 'furniture-customized-design', 'service', v_sub_furn_new, 2, 'product', true),
    ('Cabinet Design', 'ক্যাবিনেট ডিজাইন', 'furniture-cabinet-design', 'service', v_sub_furn_new, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Furniture Assemble & Fitting (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Regular Furniture', 'সাধারণ ফার্নিচার', 'furniture-regular-assemble', 'service', v_sub_furn_assemble, 2, 'product', true),
    ('Fixed and Wall Mounted Furniture', 'ফিক্সড এবং ওয়াল মাউন্টেড ফার্নিচার', 'furniture-fixed-mount-assemble', 'service', v_sub_furn_assemble, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Furniture Cover & Foam Repair (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Fixed Foam/Leather/Velvet Sofa', 'ফিক্সড ফোম/লেদার/ভেলভেট সোফা', 'sofa-fixed-foam-repair', 'service', v_sub_furn_cover, 2, 'product', true),
    ('Non-Fixed Regular Sofa', 'নন-ফিক্সড সাধারণ সোফা', 'sofa-regular-foam-repair', 'service', v_sub_furn_cover, 2, 'product', true),
    ('Chair Cover & Foam', 'চেয়ার কভার ও ফোম', 'chair-cover-foam-repair', 'service', v_sub_furn_cover, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;


    -- ==========================================
    -- 3. ALUMINIUM, GLASS & GRILL SERVICES HIERARCHY (Level 0)
    -- ==========================================
    INSERT INTO public.product_categories (name, name_bn, slug, type, level, section, is_active)
    VALUES ('Aluminium, Glass & Grill Services', 'অ্যালুমিনিয়াম, গ্লাস ও গ্রিল পরিষেবা', 'aluminium-glass-grill-root', 'service', 0, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_root_aluminium;

    -- Subcategories for Aluminium (Level 1)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Thai Glass', 'থাই গ্লাস', 'thai-glass-sub', 'service', v_root_aluminium, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_thai_glass;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Glass Works', 'গ্লাসের কাজ', 'glass-works-sub', 'service', v_root_aluminium, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_glass_works;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Mosquito Net', 'মশা নিরোধক নেট', 'mosquito-net-sub', 'service', v_root_aluminium, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_mosquito_net;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Thai Lock & wheel Service', 'থাই লক ও হুইল পরিষেবা', 'thai-lock-wheel-sub', 'service', v_root_aluminium, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_lock_service;

    -- Items for Thai Glass (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Door', 'দরজা', 'thai-glass-door', 'service', v_sub_thai_glass, 2, 'product', true),
    ('Window', 'জানালা', 'thai-glass-window', 'service', v_sub_thai_glass, 2, 'product', true),
    ('Fixed Partition', 'ফিক্সড পার্টিশন', 'thai-glass-partition', 'service', v_sub_thai_glass, 2, 'product', true),
    ('Installation & Repair', 'ইনস্টলেশন ও মেরামত', 'thai-glass-install-repair', 'service', v_sub_thai_glass, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Glass Works (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Tempered Glass (Processed)', 'টেম্পারড গ্লাস', 'tempered-glass-processed', 'service', v_sub_glass_works, 2, 'product', true),
    ('Non-Tempered Glass (Processed)', 'নন-টেম্পারড গ্লাস', 'non-temp-glass-processed', 'service', v_sub_glass_works, 2, 'product', true),
    ('Beveled Glass', 'বিভেলড গ্লাস', 'beveled-glass-item', 'service', v_sub_glass_works, 2, 'product', true),
    ('Glass Paper Pasting', 'গ্লাস পেপার পেস্টিং', 'glass-paper-pasting', 'service', v_sub_glass_works, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Mosquito Net (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Fixed Fiber Net', 'ফিক্সড ফাইবার নেট', 'fixed-fiber-net', 'service', v_sub_mosquito_net, 2, 'product', true),
    ('Sliding Fiber Net', 'স্লাইডিং ফাইবার নেট', 'sliding-fiber-net', 'service', v_sub_mosquito_net, 2, 'product', true),
    ('Fixing and Replacing Net', 'নেট ঠিক করা ও পরিবর্তন', 'mosquito-net-fix-replace', 'service', v_sub_mosquito_net, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Thai Lock & wheel Service (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Lock Installation', 'লক ইনস্টলেশন', 'thai-lock-installation', 'service', v_sub_lock_service, 2, 'product', true),
    ('Lock Repair', 'লক মেরামত', 'thai-lock-repair', 'service', v_sub_lock_service, 2, 'product', true),
    ('Wheel Installation & Repair', 'হুইল ইনস্টলেশন ও মেরামত', 'thai-wheel-install-repair', 'service', v_sub_lock_service, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;


    -- ==========================================
    -- 4. CONSTRUCTION and TILE SERVICES HIERARCHY (Level 0)
    -- ==========================================
    INSERT INTO public.product_categories (name, name_bn, slug, type, level, section, is_active)
    VALUES ('Construction and Tile Services', 'নির্মাণ ও টাইলস পরিষেবা', 'construction-tile-services-root', 'service', 0, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_root_construction;

    -- Subcategories for Construction (Level 1)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Tiles Fitting & Pasting', 'টাইলস ফিটিং ও পেস্টিং', 'tiles-fitting-pasting-sub', 'service', v_root_construction, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_tiles_fitting;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('Construction', 'নির্মাণ', 'construction-generic-sub', 'service', v_root_construction, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_construction_generic;

    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active)
    VALUES ('False Ceiling Design', 'ফলস সিলিং ডিজাইন', 'false-ceiling-design-sub', 'service', v_root_construction, 1, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section
    RETURNING id INTO v_sub_false_ceiling;

    -- Items for Tiles Fitting & Pasting (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Tiles Fitting', 'টাইলস ফিটিং', 'tiles-fitting-item', 'service', v_sub_tiles_fitting, 2, 'product', true),
    ('Tiles Re-Fitting', 'টাইলস পুনঃফিটিং', 'tiles-re-fitting-item', 'service', v_sub_tiles_fitting, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for Construction (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('Wall Construction', 'দেয়াল নির্মাণ', 'wall-construction-item', 'service', v_sub_construction_generic, 2, 'product', true),
    ('Mosaic Cutting', 'মোজাইক কাটিং', 'mosaic-cutting-item', 'service', v_sub_construction_generic, 2, 'product', true),
    ('Plaster Work', 'প্লাস্টার ওয়ার্ক', 'plaster-work-item', 'service', v_sub_construction_generic, 2, 'product', true),
    ('Construction Consultancy', 'নির্মাণ কনসালটেন্সি', 'construction-consultancy-item', 'service', v_sub_construction_generic, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

    -- Items for False Ceiling Design (Level 2)
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, level, section, is_active) VALUES
    ('White Board Ceiling', 'হোয়াইট বোর্ড সিলিং', 'white-board-ceiling-item', 'service', v_sub_false_ceiling, 2, 'product', true),
    ('Gypsum Ceiling', 'জিপসাম সিলিং', 'gypsum-ceiling-item', 'service', v_sub_false_ceiling, true),
    ('Panel Design Ceiling', 'প্যানেল ডিজাইন সিলিং', 'panel-design-ceiling-item', 'service', v_sub_false_ceiling, 2, 'product', true)
    ON CONFLICT (name, type, parent_id) DO UPDATE SET name_bn = EXCLUDED.name_bn, slug = EXCLUDED.slug, level = EXCLUDED.level, section = EXCLUDED.section;

END $$;
