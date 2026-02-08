-- ULTRA-RESILIENT PROFILE FIX
-- This migration removes ANY secondary barriers that could cause registration failure.

-- 1. DROP the trigger first to ensure a clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remove Unnecessary UNIQUE Constraints in public.profiles
-- auth.users already ensures email uniqueness; having it in profiles can cause 
-- "Database error" if a profile exists but the auth user does not (stale data).
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_number_key;

-- 3. Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 4. Re-create the function with extreme error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    final_role user_role;
BEGIN
    -- Determine role safely
    BEGIN
        final_role := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        final_role := 'customer'::user_role;
    END;

    -- Attempt primary insert/update
    INSERT INTO public.profiles (id, email, full_name, phone_number, address, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Member'),
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'address',
        COALESCE(final_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        address = COALESCE(EXCLUDED.address, public.profiles.address),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- LAST RESORT: Ensure the record exists at minimum so the trigger doesn't fail
    -- Failure here would block user registration entirely.
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, 'Valued Member', 'customer'::user_role)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Final Step: Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
