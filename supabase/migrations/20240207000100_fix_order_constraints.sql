-- Relax customer_id constraint to allow guest orders
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;

-- Change shipping_address from JSONB to TEXT to match frontend string data
-- First rename the old column to avoid data loss during conversion if there's any important data
ALTER TABLE public.orders RENAME COLUMN shipping_address TO shipping_address_old;
ALTER TABLE public.orders ADD COLUMN shipping_address TEXT;

-- (Optional) Migrating existing data if necessary, though unlikely in dev
UPDATE public.orders SET shipping_address = shipping_address_old::text;

-- Final cleanup
ALTER TABLE public.orders DROP COLUMN shipping_address_old;

-- ADD RLS Policy for Inserting Orders
-- Anyone (including guests) can place an order request
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);

-- Ensure authenticated users can still see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders 
FOR SELECT USING (
    customer_id = auth.uid() 
    OR 
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
