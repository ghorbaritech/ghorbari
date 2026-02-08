-- DIAGNOSTIC: REMOVE REGISTRATION TRIGGER
-- Run this to see if users can register WITHOUT the profile trigger.
-- If this works, the problem is definitely in the trigger function.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Also ensure no secondary triggers on profiles are blocking
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
