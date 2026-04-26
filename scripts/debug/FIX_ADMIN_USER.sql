-- Create or Update an Admin User
-- 1. Create user in auth.users (if not exists)
-- This part is tricky in pure SQL without knowing the instance ID or having pgcrypto sometimes. 
-- Best to Update an existing user to admin if one exists, OR create a dummy local one.

-- OPTION A: Promote the current user to admin (Risky if you want to test as seller)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your_email@example.com';

-- OPTION B: Insert a fresh Admin Profile linked to a placeholder ID (Only works if you can insert to auth.users or if constraint is loose)
-- Since we have foreign key constraints, we must have a valid auth.users record.

-- Let's try to update ANY user with 'admin' in their email to have the 'admin' role in profiles
UPDATE public.profiles 
SET role = 'admin' 
WHERE email LIKE '%admin%';

-- If no admin exists, we can't easily create one from SQL Editor without the Instance ID for auth.users.
-- User might need to Sign Up a new account as "admin@ghorbari.com" and then run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@ghorbari.com';
