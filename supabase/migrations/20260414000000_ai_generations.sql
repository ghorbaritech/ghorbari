-- Migration: Add AI Generations Table for NanoBanana Prompt Caching
-- Description: Stores lightweight generate prompts and metadata instead of saving heavy 4K images initially.
-- This saves massive Supabase bucket storage. Actual PNGs are only stored when the user explicitly hits "Save to Project".

CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style_preset VARCHAR(50),
    negative_prompt TEXT,
    seed BIGINT,
    saved_to_project BOOLEAN DEFAULT FALSE,
    project_image_url TEXT, -- Only populated IF saved_to_project is TRUE
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own AI generations"
    ON public.ai_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI generations"
    ON public.ai_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI generations (save to project)"
    ON public.ai_generations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Expose to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_generations;
