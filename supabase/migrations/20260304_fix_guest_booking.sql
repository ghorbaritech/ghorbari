-- Migration to support guest bookings for services and designs

-- Update service_requests table
ALTER TABLE public.service_requests
ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Update design_bookings table (if it exists and has user_id)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'design_bookings') THEN
        ALTER TABLE public.design_bookings
        ALTER COLUMN user_id DROP NOT NULL;

        ALTER TABLE public.design_bookings
        ADD COLUMN IF NOT EXISTS customer_email TEXT,
        ADD COLUMN IF NOT EXISTS customer_phone TEXT,
        ADD COLUMN IF NOT EXISTS customer_name TEXT;
    END IF;
END $$;

-- Update RLS policies to allow guest inserts

-- service_requests
DROP POLICY IF EXISTS "Users can insert own requests" ON public.service_requests;

CREATE POLICY "Users can insert own requests or guests can insert" 
ON public.service_requests FOR INSERT 
WITH CHECK (
    auth.uid() = customer_id OR customer_id IS NULL
);

-- design_bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'design_bookings') THEN
        DROP POLICY IF EXISTS "Users can create their own bookings" ON public.design_bookings;
        
        CREATE POLICY "Users or guests can create bookings" 
        ON public.design_bookings FOR INSERT 
        WITH CHECK (
            auth.uid() = user_id OR user_id IS NULL
        );
    END IF;
END $$;
