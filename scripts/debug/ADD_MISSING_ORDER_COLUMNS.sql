-- Add missing columns to orders table to support checkout flow

DO $$
BEGIN
    -- 1. Advance Amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'advance_amount') THEN
        ALTER TABLE public.orders ADD COLUMN advance_amount NUMERIC DEFAULT 0;
    END IF;

    -- 2. Remaining Amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'remaining_amount') THEN
        ALTER TABLE public.orders ADD COLUMN remaining_amount NUMERIC DEFAULT 0;
    END IF;

    -- 3. VAT Amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'vat_amount') THEN
        ALTER TABLE public.orders ADD COLUMN vat_amount NUMERIC DEFAULT 0;
    END IF;

    -- 4. Platform Fee
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'platform_fee') THEN
        ALTER TABLE public.orders ADD COLUMN platform_fee NUMERIC DEFAULT 0;
    END IF;

    -- 5. Items (JSONB) - Ensure it exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- 6. Customer Note (Optional but good to have)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'note') THEN
        ALTER TABLE public.orders ADD COLUMN note TEXT;
    END IF;

END $$;

-- Refresh schema cache advice
NOTIFY pgrst, 'reload schema';
