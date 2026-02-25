-- Migration: Fix Service Booking RLS
-- Allows authenticated users to create service requests and items.

-- 1. Service Requests Policies
-- Ensure users can insert their own requests
CREATE POLICY "Users can insert own service requests" ON public.service_requests 
FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 2. Service Request Items Policies
-- Allows users to insert items if they own the parent request
CREATE POLICY "Users can insert own service request items" ON public.service_request_items 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.service_requests 
        WHERE id = request_id AND customer_id = auth.uid()
    )
);

-- Note: SELECT policies already exist in the previous migration, 
-- but ensuring they cover the correct scope.
DROP POLICY IF EXISTS "Users view own request items" ON public.service_request_items;
CREATE POLICY "Users view own request items" ON public.service_request_items 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.service_requests 
        WHERE id = request_id AND customer_id = auth.uid()
    )
);
