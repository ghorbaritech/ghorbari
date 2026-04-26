-- Create a highly optimized auth checking function that prefers JWT over DB lookup
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
    (SELECT role::text FROM public.profiles WHERE id = auth.uid())
  ) = 'admin';
$$;

-- Refactor primary bottlenecks: Service Requests
DROP POLICY IF EXISTS "admin_service_requests_management" ON public.service_requests;
CREATE POLICY "admin_service_requests_management" ON public.service_requests 
FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_service_request_items_management" ON public.service_request_items;
CREATE POLICY "admin_service_request_items_management" ON public.service_request_items 
FOR ALL TO authenticated USING (public.is_admin());

-- Refactor Bookings
DROP POLICY IF EXISTS "Admins manage all bookings" ON public.bookings;
CREATE POLICY "Admins manage all bookings" ON public.bookings 
FOR ALL USING (public.is_admin());

-- Refactor Home Content & CMS
DROP POLICY IF EXISTS "Admins manage home content" ON public.home_content;
CREATE POLICY "Admins manage home content" ON public.home_content 
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.product_categories;
CREATE POLICY "Admins can insert categories" ON public.product_categories FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.product_categories;
CREATE POLICY "Admins can update categories" ON public.product_categories FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.product_categories;
CREATE POLICY "Admins can delete categories" ON public.product_categories FOR DELETE USING (public.is_admin());

-- Refactor Retailer Ledgers
DROP POLICY IF EXISTS "Admins manage ledger" ON public.seller_ledger;
CREATE POLICY "Admins manage ledger" ON public.seller_ledger FOR ALL USING (public.is_admin());
