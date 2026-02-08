-- RETROACTIVE PROFILE SYNC
-- This script finds any users in auth.users who are missing a profile and creates them.
-- Run this in your Supabase SQL Editor.

INSERT INTO public.profiles (id, email, full_name, phone_number, address, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Valued Member'),
    raw_user_meta_data->>'phone_number',
    raw_user_meta_data->>'address',
    COALESCE((raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
