-- CLEAN SLATE: NUCLEAR PROFILE TRIGGER RESET
-- This script drops ALL known and potential conflicting triggers on auth.users
-- and replaces them with a single, ultra-simple, fail-safe trigger.

-- 1. DROP ALL POTENTIAL TRIGGERS ON auth.users
-- This covers various names used in previous migrations or common default names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS ensure_profile_exists ON auth.users;

-- 2. DROP ALL POTENTIAL TRIGGERS ON public.profiles (To ensure no secondary failure)
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;

-- 3. DEFINE THE ULTRA-SIMPLE FUNCTION
-- This version does NOT rely on complex metadata parsing for the primary insert.
-- It ensures that even if EVERY logic step fails, it STILL returns NEW to allow registration.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic Insert with minimal fields
  -- We use a raw sub-block to catch and ignore ANY error during profile creation.
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Member'),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- If the above fails, we log it but DO NOT block the registration
    -- This ensures the user is created in auth.users even if the profile isn't.
    INSERT INTO public.debug_logs (event_name, error_message, metadata)
    VALUES ('handle_new_user_CRITICAL_FAILURE', SQLERRM, jsonb_build_object('user_id', NEW.id));
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. RE-ATTACH THE SINGLE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RE-ATTACH MODTIME TRIGGER
CREATE TRIGGER update_profiles_modtime 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
