-- 0. Ensure address column exists in public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 1. Update the handle_new_user function to be more robust
-- It now captures phone_number and uses ON CONFLICT to prevent failures
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
    full_name = EXCLUDED.full_name,
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Note on phone_number uniqueness:
-- If you are seeing "Database error saving new user" when using the SAME phone number with a DIFFERENT email,
-- it means there is a UNIQUE constraint on the phone_number column.
-- Run this to remove it if you want to allow multiple accounts per phone:
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_number_key;
