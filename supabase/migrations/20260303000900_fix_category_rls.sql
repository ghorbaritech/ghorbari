-- FIX: Enable Admin Management of Categories (RLS)
-- Currently, product_categories has RLS enabled but no policies for INSERT/UPDATE/DELETE.
-- This silently blocks admins from modifying categories.

-- 1. Enable RLS (Should already be enabled)
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for Admins
DO $$
BEGIN
    -- DROP existing policies to be safe/clean
    DROP POLICY IF EXISTS "Admins can insert categories" ON public.product_categories;
    DROP POLICY IF EXISTS "Admins can update categories" ON public.product_categories;
    DROP POLICY IF EXISTS "Admins can delete categories" ON public.product_categories;

    -- CREATE fresh policies
    CREATE POLICY "Admins can insert categories" ON public.product_categories
        FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );

    CREATE POLICY "Admins can update categories" ON public.product_categories
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );

    CREATE POLICY "Admins can delete categories" ON public.product_categories
        FOR DELETE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        );
END $$;
