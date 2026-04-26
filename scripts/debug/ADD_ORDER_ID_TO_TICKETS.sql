-- Add order_id to support_tickets to link tickets to specific orders
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON public.support_tickets(order_id);
