-- FIX: Add missing 'updated_at' column to conversations
-- The frontend code expects this column for sorting chats and updating timestamps.

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Optional: Create a trigger to auto-update it when messages are added (if you want)
-- For now, the frontend is manually passing it on insert, which is fine.
