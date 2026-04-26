-- Enable read access for all users
-- This fixes the "Error fetching categories" issue if RLS is enabled but no SELECT policy exists.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_categories' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON "public"."product_categories"
        AS PERMISSIVE FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;
