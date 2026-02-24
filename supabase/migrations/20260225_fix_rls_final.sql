-- Final Consolidated RLS Fix for Service Bookings
-- This script clears previous policies and sets up a robust, clashing-free security layer.

-- 1. CLEANUP: Drop all possible existing policies to avoid clashes
DROP POLICY IF EXISTS "Authenticated users can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users can update own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Customers manage own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Designers view assigned requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins manage everything" ON public.service_requests;

DROP POLICY IF EXISTS "Authenticated users can insert service request items" ON public.service_request_items;
DROP POLICY IF EXISTS "Authenticated users can update own service request items" ON public.service_request_items;
DROP POLICY IF EXISTS "Users view own request items" ON public.service_request_items;
DROP POLICY IF EXISTS "Admins manage service items" ON public.service_request_items;

-- 2. SERVICE REQUESTS: One broad policy for authenticated users to manage their own requests
CREATE POLICY "authenticated_service_requests_management" ON public.service_requests 
FOR ALL TO authenticated 
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- Keep Admin access
CREATE POLICY "admin_service_requests_management" ON public.service_requests 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. SERVICE REQUEST ITEMS: Linked to the user's service request
CREATE POLICY "authenticated_service_request_items_management" ON public.service_request_items 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.service_requests 
        WHERE id = request_id AND customer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.service_requests 
        WHERE id = request_id AND customer_id = auth.uid()
    )
);

-- Keep Admin access for items
CREATE POLICY "admin_service_request_items_management" ON public.service_request_items 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. GRANTS: Ensure roles have permission to execute commands
GRANT ALL ON public.service_requests TO authenticated;
GRANT ALL ON public.service_request_items TO authenticated;
