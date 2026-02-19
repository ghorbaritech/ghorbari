-- 1. Allow users to create conversations where they are a participant
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- 2. Allow users to send messages to conversations they are part of
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
