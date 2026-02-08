-- Enhance Orders Table for detailed payment tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0;

-- Update status options comment (for reference)
-- Waiting for Confirmation: 'pending'
-- Routed to Retailer: 'confirmed'
-- Completed: 'delivered'
