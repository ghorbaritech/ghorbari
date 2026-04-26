-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Support Tickets Table if it doesn't exist
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

-- 2. Add order_id column (if it wasn't created above or in previous runs)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'order_id') THEN
        ALTER TABLE public.support_tickets ADD COLUMN order_id UUID REFERENCES public.orders(id);
    END IF;
END $$;

-- 3. Add Index
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON public.support_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);

-- 4. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies (Drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;

CREATE POLICY "Users view own tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'support'))
    );

CREATE POLICY "Users create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant Permissions (Safe measure)
GRANT ALL ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
