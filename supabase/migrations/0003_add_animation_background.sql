-- Migration: 0003_add_animation_background.sql
-- Adds background JSONB column to animations table

ALTER TABLE animations 
ADD COLUMN IF NOT EXISTS background jsonb;
