-- 1. Grant Admin Access to Orders
-- This allows users with the 'admin' role to see and manage all orders

DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
CREATE POLICY "Admins manage all orders" ON public.orders
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Ensure previous guest orders are visible
-- If orders were placed as guest, customer_id will be NULL.
-- The existing "Users can view own orders" policy checks (customer_id = auth.uid()).
-- We'll keep that but the Admin policy above will cover the dashboard view.

-- 3. Verify standard order visibility for customers/sellers (updated to be explicit)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders 
FOR SELECT USING (
    customer_id = auth.uid() 
    OR 
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
