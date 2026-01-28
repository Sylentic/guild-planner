-- Migration: Add guild_icon_url to clans table
ALTER TABLE clans ADD COLUMN IF NOT EXISTS guild_icon_url TEXT;