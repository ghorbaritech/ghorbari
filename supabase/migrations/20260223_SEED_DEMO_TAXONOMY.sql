-- Migration: Seed Custom Categories and Packages for Aesthetic Architects

-- 1. Create Categories (Using existing helper from SEED_TAXONOMY or raw inserts)
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
BEGIN
    -- [ STRUCTURAL ] --
    -- Root: Structural and Architectural Design
    INSERT INTO public.product_categories (name, slug, level, section, is_active)
    VALUES ('Structural and Architectural Design', 'structural-and-architectural-design', 0, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_structural_id;

    -- Sub: Building Design
    INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
    VALUES ('Building Design', 'building-design-sub', 1, v_structural_id, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
    RETURNING id INTO v_bldg_design_id;

    -- Sub: Building Approval
    INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
    VALUES ('Building Approval', 'building-approval-sub', 1, v_structural_id, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
    RETURNING id INTO v_bldg_approval_id;

    -- [ INTERIOR ] --
    -- Root: Interior Design
    INSERT INTO public.product_categories (name, slug, level, section, is_active)
    VALUES ('Interior Design', 'interior-design', 0, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_interior_id;

    -- Sub: Full Apartment
    INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
    VALUES ('Full Apartment', 'full-apartment-interior', 1, v_interior_id, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
    RETURNING id INTO v_full_apt_id;
    
    -- Sub: Specific Area
    INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
    VALUES ('Specific Area', 'specific-area-interior', 1, v_interior_id, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
    RETURNING id INTO v_specific_area_id;

    -- Sub-Sub: Master Bedroom
    INSERT INTO public.product_categories (name, slug, level, parent_id, section, is_active)
    VALUES ('Master Bedroom', 'master-bedroom-interior', 2, v_specific_area_id, 'design', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id
    RETURNING id INTO v_master_bed_id;


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
