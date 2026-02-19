-- Fix RLS to allow creating conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Also ensure 'conversations' is readable by participants (existing policy covers this but good to double check or ensure no conflict)
-- The existing policy is: "Conversation access" ON public.conversations FOR SELECT USING (auth.uid() IN (participant_1_id, participant_2_id));

-- Fix Messages Policy if needed (The existing one 'Message access' is FOR ALL, so it should be fine)
-- But let's be explicit for INSERT to be safe
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
