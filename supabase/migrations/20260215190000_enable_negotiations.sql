-- Migration: Enable Negotiations for Services and Products

-- 1. Create Product Inquiries Table (for Retailer Quotations)
CREATE TABLE IF NOT EXISTS public.product_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_number TEXT UNIQUE NOT NULL, -- e.g., INQ-1001
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    seller_id UUID REFERENCES public.sellers(id) NOT NULL,
    items JSONB NOT NULL, -- Snapshot of items: [{ product_id, quantity, name, price }]
    status TEXT DEFAULT 'pending_quote', -- pending_quote, quoted, negotiation, accepted, rejected, ordered
    quotation_history JSONB DEFAULT '[]'::jsonb, -- [{ by: 'seller', amount: 500, note: '' }]
    total_amount DECIMAL(10,2), -- Initial requested amount (sum of items)
    agreed_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS for Product Inquiries
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer view own inquiries" ON public.product_inquiries 
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Seller view assigned inquiries" ON public.product_inquiries 
    FOR SELECT USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create inquiries" ON public.product_inquiries 
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Participants update inquiries" ON public.product_inquiries 
    FOR UPDATE USING (
        customer_id = auth.uid() OR 
        seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    );

-- 3. Update Service Requests to support Negotiation (mirroring design_bookings)
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS quotation_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS agreed_amount DECIMAL(10,2);

-- 4. Trigger for timestamps
CREATE TRIGGER update_product_inquiries_modtime 
BEFORE UPDATE ON public.product_inquiries 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
