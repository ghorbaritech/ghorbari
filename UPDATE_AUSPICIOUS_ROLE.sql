-- The user clarified that Auspicious is a "partner who will sell the product only".
-- In our system, this maps to the 'seller' role.

UPDATE public.profiles
SET role = 'seller'
WHERE full_name ILIKE '%Auspicious%' OR email ILIKE '%auspicious%';

-- Verify the change
SELECT id, full_name, email, role FROM public.profiles WHERE full_name ILIKE '%Auspicious%';
