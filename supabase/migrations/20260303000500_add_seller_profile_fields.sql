-- Migration: Add Seller Profile Fields
-- Run this in Supabase SQL Editor

ALTER TABLE public.sellers
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS shop_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT,
    ADD COLUMN IF NOT EXISTS founded_year INTEGER,
    ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_order_value DECIMAL(12,2) DEFAULT 0.0;

-- Backfill: Set a default bio for existing sellers
UPDATE public.sellers SET bio = 'Verified supplier on the Ghorbari platform.' WHERE bio IS NULL;

-- Update RLS: ensure public can see non-sensitive profile fields of active sellers
DROP POLICY IF EXISTS "Anyone can view verified sellers" ON public.sellers;
CREATE POLICY "Anyone can view active sellers" ON public.sellers
    FOR SELECT USING (is_active = true);
