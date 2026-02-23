-- Migration: Add Address and Change Logs to Profiles
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS change_log JSONB[] DEFAULT '{}';
