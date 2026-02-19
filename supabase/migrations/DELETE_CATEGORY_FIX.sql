-- FIX: Allow Category Deletion by setting foreign keys to SET NULL
-- Uses DO blocks to only modify tables that exist

-- 1. Products (Should always exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE public.products
        DROP CONSTRAINT IF EXISTS products_category_id_fkey;
        
        ALTER TABLE public.products
        ADD CONSTRAINT products_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES public.product_categories(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Milestone Templates
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'milestone_templates') THEN
        ALTER TABLE public.milestone_templates
        DROP CONSTRAINT IF EXISTS milestone_templates_category_id_fkey;

        ALTER TABLE public.milestone_templates
        ADD CONSTRAINT milestone_templates_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES public.product_categories(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Service Packages
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_packages') THEN
        ALTER TABLE public.service_packages
        DROP CONSTRAINT IF EXISTS service_packages_category_id_fkey;

        ALTER TABLE public.service_packages
        ADD CONSTRAINT service_packages_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES public.product_categories(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Design Packages
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'design_packages') THEN
        ALTER TABLE public.design_packages
        DROP CONSTRAINT IF EXISTS design_packages_category_id_fkey;

        ALTER TABLE public.design_packages
        ADD CONSTRAINT design_packages_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES public.product_categories(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Product Categories Self-Reference (Crucial fix for parent deletion)
DO $$
BEGIN
    -- Drop existing constraint (likely strict RESTRICT)
    ALTER TABLE public.product_categories
    DROP CONSTRAINT IF EXISTS product_categories_parent_id_fkey;

    -- Re-add with SET NULL
    ALTER TABLE public.product_categories
    ADD CONSTRAINT product_categories_parent_id_fkey
        FOREIGN KEY (parent_id)
        REFERENCES public.product_categories(id)
        ON DELETE SET NULL;
END $$;
