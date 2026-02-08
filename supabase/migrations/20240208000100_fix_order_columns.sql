-- Add missing guest contact columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Adjust shipping_address to TEXT if needed, or keep as JSONB but ensure code matches
-- The code currently passes a string, so let's allow shipping_address to handle both or just use TEXT for simplicity if it's always a flat string now.
-- However, existing schema says JSONB. Let's make it TEXT since we are building a consolidated string in the frontend.
ALTER TABLE public.orders 
ALTER COLUMN shipping_address TYPE TEXT USING shipping_address::TEXT;

-- Add payment_status if missing (though it was in initial schema, let's be sure)
-- Add columns for admin routing tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;
