-- Migration: Seed Custom Categories and Packages for Aesthetic Architects

-- 1. Create Categories
DO $$
DECLARE
    v_structural_id UUID;
    v_bldg_design_id UUID;
    v_bldg_approval_id UUID;
    
    v_interior_id UUID;
    v_full_apt_id UUID;
    v_specific_area_id UUID;
    v_master_bed_id UUID;
    
    v_designer_id UUID := '7a49eca1-1934-461a-8d68-cf55f360c650';

    -- Helper variables for upserts
    v_temp_id UUID;
BEGIN
    -- [ STRUCTURAL ] --
    -- Root: Structural and Architectural Design
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'structural-and-architectural-design' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, section, is_active)
        VALUES ('Structural and Architectural Design', 'structural-and-architectural-design', 0, 'design', true)
        RETURNING id INTO v_structural_id;
    ELSE
        UPDATE public.product_categories SET name = 'Structural and Architectural Design', level = 0, section = 'design', is_active = true WHERE id = v_temp_id;
        v_structural_id := v_temp_id;
    END IF;

    -- Sub: Building Design
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'building-design-sub' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
        VALUES ('Building Design', 'building-design-sub', 1, v_structural_id, 'design', true)
        RETURNING id INTO v_bldg_design_id;
    ELSE
        UPDATE public.product_categories SET name = 'Building Design', parent_id = v_structural_id, level = 1, section = 'design', is_active = true WHERE id = v_temp_id;
        v_bldg_design_id := v_temp_id;
    END IF;

    -- Sub: Building Approval
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'building-approval-sub' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
        VALUES ('Building Approval', 'building-approval-sub', 1, v_structural_id, 'design', true)
        RETURNING id INTO v_bldg_approval_id;
    ELSE
        UPDATE public.product_categories SET name = 'Building Approval', parent_id = v_structural_id, level = 1, section = 'design', is_active = true WHERE id = v_temp_id;
        v_bldg_approval_id := v_temp_id;
    END IF;

    -- [ INTERIOR ] --
    -- Root: Interior Design
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'interior-design' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, section, is_active)
        VALUES ('Interior Design', 'interior-design', 0, 'design', true)
        RETURNING id INTO v_interior_id;
    ELSE
        UPDATE public.product_categories SET name = 'Interior Design', level = 0, section = 'design', is_active = true WHERE id = v_temp_id;
        v_interior_id := v_temp_id;
    END IF;

    -- Sub: Full Apartment
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'full-apartment-interior' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
        VALUES ('Full Apartment', 'full-apartment-interior', 1, v_interior_id, 'design', true)
        RETURNING id INTO v_full_apt_id;
    ELSE
        UPDATE public.product_categories SET name = 'Full Apartment', parent_id = v_interior_id, level = 1, section = 'design', is_active = true WHERE id = v_temp_id;
        v_full_apt_id := v_temp_id;
    END IF;
    
    -- Sub: Specific Area
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'specific-area-interior' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
        VALUES ('Specific Area', 'specific-area-interior', 1, v_interior_id, 'design', true)
        RETURNING id INTO v_specific_area_id;
    ELSE
        UPDATE public.product_categories SET name = 'Specific Area', parent_id = v_interior_id, level = 1, section = 'design', is_active = true WHERE id = v_temp_id;
        v_specific_area_id := v_temp_id;
    END IF;

    -- Sub-Sub: Master Bedroom
    SELECT id INTO v_temp_id FROM public.product_categories WHERE slug = 'master-bedroom-interior' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
        VALUES ('Master Bedroom', 'master-bedroom-interior', 2, v_specific_area_id, 'design', true)
        RETURNING id INTO v_master_bed_id;
    ELSE
        UPDATE public.product_categories SET name = 'Master Bedroom', parent_id = v_specific_area_id, level = 2, section = 'design', is_active = true WHERE id = v_temp_id;
        v_master_bed_id := v_temp_id;
    END IF;


    -- 2. Insert Packages for Aesthetic Architects
    -- Clear out old dummy packages for this designer first
    DELETE FROM public.design_packages WHERE designer_id = v_designer_id;

    -- Package 1: Complete Architectural Blueprint
    INSERT INTO public.design_packages (designer_id, category_id, title, description, price, images, unit)
    VALUES (
        v_designer_id, 
        v_bldg_design_id, 
        'Complete Architectural Blueprint', 
        'A full end-to-end structural blueprint tailored to your land dimensions, ensuring safety and standard aesthetic rules.', 
        50000.00, 
        ARRAY['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800'],
        'job'
    );

    -- Package 2: Rajuk Building Approval Service
    INSERT INTO public.design_packages (designer_id, category_id, title, description, price, images, unit)
    VALUES (
        v_designer_id, 
        v_bldg_approval_id, 
        'Rajuk Building Approval Service', 
        'We handle all bureaucratic operations to get your structural design approved by Rajuk.', 
        30000.00, 
        ARRAY['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'],
        'job'
    );

    -- Package 3: Premium Full Apartment Interior
    INSERT INTO public.design_packages (designer_id, category_id, title, description, price, images, unit)
    VALUES (
        v_designer_id, 
        v_full_apt_id, 
        'Premium Full Apartment Interior', 
        'A complete interior design overhaul for apartments up to 2500 sq ft, including 3D renders.', 
        120000.00, 
        ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'],
        'job'
    );

    -- Package 4: Master Bedroom Aesthetic Layout
    INSERT INTO public.design_packages (designer_id, category_id, title, description, price, images, unit)
    VALUES (
        v_designer_id, 
        v_master_bed_id, 
        'Master Bedroom Aesthetic Layout', 
        'Specialized layout planning for master bedrooms to maximize space, luxury, and aesthetics.', 
        25000.00, 
        ARRAY['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
        'job'
    );

END $$;
