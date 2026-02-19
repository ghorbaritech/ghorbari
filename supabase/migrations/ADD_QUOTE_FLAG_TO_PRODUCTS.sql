-- Add is_quote_only flag to products to support "Ask for Quote" flow
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_quote_only BOOLEAN DEFAULT false;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_products_quote_only ON public.products(is_quote_only);
