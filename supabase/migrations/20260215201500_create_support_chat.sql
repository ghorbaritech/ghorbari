-- Migration: Unified Communication System (Support & Chat)

-- 1. Create Conversations Table (Context-aware chat containers)
-- This allows linking chats to orders, tickets, or general inquiries
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'support_ticket', 'order_chat', 'inquiry_chat', 'direct_message'
    context_id UUID, -- Links to support_tickets.id, orders.id, etc.
    participants UUID[] NOT NULL, -- Array of user_ids involved
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL, -- sender
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL, -- e.g. TKT-2024-001
    user_id UUID REFERENCES public.profiles(id) NOT NULL, -- Creator
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'order', 'payment', 'account', 'technical'
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to UUID REFERENCES public.profiles(id), -- Admin/Agent handling it
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Users view their conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Messages RLS
CREATE POLICY "Users view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = messages.conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND auth.uid() = ANY(participants)
        )
    );

-- Support Tickets RLS
CREATE POLICY "Users view own tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "Users create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Triggers for updated_at
CREATE TRIGGER update_conversations_modtime 
BEFORE UPDATE ON public.conversations 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_support_tickets_modtime 
BEFORE UPDATE ON public.support_tickets 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Helper to create conversation on ticket creation?
-- Maybe better handled in application logic to keep SQL simple.
