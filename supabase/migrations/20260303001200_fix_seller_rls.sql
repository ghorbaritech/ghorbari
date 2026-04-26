-- 1. Allow Sellers and Designers to VIEW their own profile even if pending
CREATE POLICY "Sellers can view own data link" ON public.sellers 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Designers can view own data link" ON public.designers 
FOR SELECT USING (user_id = auth.uid());

-- 2. Manually create the missing Seller record for 'auspicious@gmail.com'
-- We find the user by email from auth.users (requires superuser/postgres role to run usually, or we use a DO block)

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get User ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'auspicious@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- Check if seller record exists
        IF NOT EXISTS (SELECT 1 FROM public.sellers WHERE user_id = target_user_id) THEN
            INSERT INTO public.sellers (
                user_id, 
                business_name, 
                business_type, 
                primary_categories, 
                verification_status, 
                is_active
            ) VALUES (
                target_user_id,
                'Auspicious Tech',
                'Retailer',
                ARRAY['Cement', 'Steel'],
                'pending',
                true
            );
        END IF;
    END IF;
END $$;
