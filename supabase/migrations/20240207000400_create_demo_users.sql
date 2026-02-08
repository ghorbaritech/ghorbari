-- GHORBARI SUPER FIX & DEMO ACCOUNTS
-- Run this entire script in your Supabase SQL Editor

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. CLEANUP EXISTING DEMO DATA (Avoids constraint conflicts)
DELETE FROM public.profiles WHERE email IN ('admin@ghorbari.com', 'retailer@ghorbari.com');
DELETE FROM auth.users WHERE email IN ('admin@ghorbari.com', 'retailer@ghorbari.com');

-- 3. ENSURE TABLE IS CORRECT
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT; -- Double check column exists

-- 4. ULTRA-RESILIENT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, address, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Member'),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE ADMIN ACCOUNT
-- Email: admin@ghorbari.com
-- Password: password123
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, recovery_sent_at, last_sign_in_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@ghorbari.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Admin","role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 6. CREATE RETAILER ACCOUNT
-- Email: retailer@ghorbari.com
-- Password: password123
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, recovery_sent_at, last_sign_in_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'retailer@ghorbari.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Retailer","role":"seller"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 7. MANUALLY FIX ROLES (In case trigger didn't catch the metadata role)
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@ghorbari.com';
UPDATE public.profiles SET role = 'seller' WHERE email = 'retailer@ghorbari.com';

-- 8. CREATE SELLER RECORD FOR RETAILER
INSERT INTO public.sellers (id, user_id, business_name, verification_status, is_active)
SELECT 
    gen_random_uuid(),
    id,
    'Ghorbari Demo Store',
    'verified',
    true
FROM public.profiles 
WHERE email = 'retailer@ghorbari.com'
ON CONFLICT DO NOTHING;
