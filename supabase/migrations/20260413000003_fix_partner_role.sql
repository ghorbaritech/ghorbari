-- 1. Add 'partner' to the enum if it doesn't exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'partner';

-- 2. Update the user
UPDATE public.profiles
SET role = 'partner'
WHERE full_name ILIKE '%Auspicious%' OR email ILIKE '%auspicious%';

-- 3. Verify
SELECT id, full_name, email, role FROM public.profiles WHERE full_name ILIKE '%Auspicious%';
