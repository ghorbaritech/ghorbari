-- Migration: Create Service Taxonomy (Categories and Subcategories)
-- This script adds the requested service hierarchy with slugs and Bengali translations.

DO $$
DECLARE
    v_paint_id UUID;
    v_carpentry_id UUID;
    v_aluminium_id UUID;
    v_construction_id UUID;
BEGIN
    -- 1. Create Top-Level Categories
    INSERT INTO public.product_categories (name, name_bn, slug, type, is_active)
    VALUES ('Paint Service', 'রং পরিষেবা', 'paint-service', 'service', true)
    RETURNING id INTO v_paint_id;

    INSERT INTO public.product_categories (name, name_bn, slug, type, is_active)
    VALUES ('Carpentry Services', 'ছুতার পরিষেবা', 'carpentry-services', 'service', true)
    RETURNING id INTO v_carpentry_id;

    INSERT INTO public.product_categories (name, name_bn, slug, type, is_active)
    VALUES ('Aluminium, Glass & Grill Services', 'অ্যালুমিনিয়াম, গ্লাস ও গ্রিল পরিষেবা', 'aluminium-glass-grill', 'service', true)
    RETURNING id INTO v_aluminium_id;

    INSERT INTO public.product_categories (name, name_bn, slug, type, is_active)
    VALUES ('Construction and Tile Services', 'নির্মাণ ও টাইলস পরিষেবা', 'construction-tile-services', 'service', true)
    RETURNING id INTO v_construction_id;

    -- 2. Create Subcategories for Paint Service
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, is_active) VALUES
    ('Interior Paint', 'অভ্যন্তরীণ রং', 'interior-paint', 'service', v_paint_id, true),
    ('Enamel Paint', 'এনামেল রং', 'enamel-paint', 'service', v_paint_id, true),
    ('Damp Repair', 'ড্যাম্প মেরামত', 'damp-repair', 'service', v_paint_id, true),
    ('Wood & Furniture Paint', 'কাঠ ও ফার্নিচার রং', 'wood-furniture-paint', 'service', v_paint_id, true);

    -- 3. Create Subcategories for Carpentry Services
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, is_active) VALUES
    ('Furniture Repair & Fixes', 'ফার্নিচার মেরামত ও ঠিক করা', 'furniture-repair', 'service', v_carpentry_id, true),
    ('New Furniture', 'নতুন ফার্নিচার', 'new-furniture', 'service', v_carpentry_id, true),
    ('Furniture Assemble & Fitting', 'ফার্নিচার অ্যাসেম্বল ও ফিটিং', 'furniture-assemble', 'service', v_carpentry_id, true),
    ('Furniture Cover & Foam Repair', 'ফার্নিচার কভার ও ফোম মেরামত', 'furniture-cover-foam-repair', 'service', v_carpentry_id, true);

    -- 4. Create Subcategories for Aluminium, Glass & Grill Services
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, is_active) VALUES
    ('Thai Glass', 'থাই গ্লাস', 'thai-glass', 'service', v_aluminium_id, true),
    ('Glass Works', 'গ্লাসের কাজ', 'glass-works', 'service', v_aluminium_id, true),
    ('Mosquito Net', 'মশা নিরোধক নেট', 'mosquito-net', 'service', v_aluminium_id, true),
    ('Thai Lock & wheel Service', 'থাই লক ও হুইল পরিষেবা', 'thai-lock-wheel', 'service', v_aluminium_id, true);

    -- 5. Create Subcategories for Construction and Tile Services
    INSERT INTO public.product_categories (name, name_bn, slug, type, parent_id, is_active) VALUES
    ('Tiles Fitting & Pasting', 'টাইলস ফিটিং ও পেস্টিং', 'tiles-fitting', 'service', v_construction_id, true),
    ('Construction', 'নির্মাণ', 'construction-generic', 'service', v_construction_id, true),
    ('False Ceiling Design', 'ফলস সিলিং ডিজাইন', 'false-ceiling-design', 'service', v_construction_id, true);

END $$;
