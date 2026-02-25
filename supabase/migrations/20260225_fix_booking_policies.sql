-- Add INSERT policies for service booking flow

-- 1. service_requests table
CREATE POLICY "Authenticated users can create service requests" ON public.service_requests 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Authenticated users can update own service requests" ON public.service_requests 
FOR UPDATE TO authenticated 
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- 2. service_request_items table
CREATE POLICY "Authenticated users can insert service request items" ON public.service_request_items 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.service_requests 
        WHERE id = request_id AND customer_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can update own service request items" ON public.service_request_items 
FOR UPDATE TO authenticated 
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
