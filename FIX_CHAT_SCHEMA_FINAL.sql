-- ==========================================================
-- FINAL FIX FOR CHAT SYSTEM (CORRECTED)
-- ==========================================================

-- 1. Ensure Extension Exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Standardize 'conversations' table
-- Ensure columns exist
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID REFERENCES public.profiles(id),
    participant_2_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    related_service_id UUID REFERENCES public.service_requests(id),
    UNIQUE(participant_1_id, participant_2_id)
);

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_1_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS participant_2_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Standardize 'messages' table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FORCE ENABLE RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. DROP ALL OLD POLICIES
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Conversation access" ON public.conversations;
DROP POLICY IF EXISTS "Users view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Select Own Conversations" ON public.conversations;
DROP POLICY IF EXISTS "Insert Own Conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Message access" ON public.messages;
DROP POLICY IF EXISTS "Users view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Select Own Messages" ON public.messages;
DROP POLICY IF EXISTS "Insert Own Messages" ON public.messages;

-- 6. CREATE NEW CORRECT POLICIES

-- A. Conversations
CREATE POLICY "Select Own Conversations" ON public.conversations
FOR SELECT USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
);

CREATE POLICY "Insert Own Conversations" ON public.conversations
FOR INSERT WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
);

-- B. Messages
-- SELECT: Users can see messages in conversations they belong to
CREATE POLICY "Select Own Messages" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id  -- FIXED: used 'messages' table name
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
);

-- INSERT: Users can send messages to conversations they belong to
CREATE POLICY "Insert Own Messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
);

-- 7. ENSURE ADMIN EXISTS
UPDATE public.profiles SET role = 'admin' WHERE email LIKE '%admin%';
