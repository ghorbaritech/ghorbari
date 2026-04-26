-- ==========================================
-- GHORBARI SUPPORT CHAT REPAIR SCRIPT
-- Run this in Supabase SQL Editor to fix "Contact Support" issues
-- ==========================================

-- 1. Enable required extensions (for ID generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Fix RLS Policies (Allow creating conversations and messages)
-- Allow users to create conversations involved in
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Allow users to send messages to their conversations
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id 
        AND EXISTS (
             SELECT 1 FROM public.conversations 
             WHERE id = conversation_id 
             AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

-- 3. ENSURE AN ADMIN EXISTS
-- This will look for any user with "admin" in their email and make them an admin.
UPDATE public.profiles 
SET role = 'admin' 
WHERE email LIKE '%admin%';

-- 4. (Optional) Create a fallback admin profile if none exists
-- Note: This only creates the profile, not the auth.user. 
-- You must sign up as 'support@ghorbari.com' for this to work fully 
-- if no admin exists yet.
-- This part is just a safeguard to prevent foreign key errors if we force an insert.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        RAISE NOTICE 'No Admin found! please sign up a user with email containing "admin"';
    ELSE
        RAISE NOTICE 'Admin user exists.';
    END IF;
END $$;
