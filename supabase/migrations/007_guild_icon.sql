-- Migration: Add guild_icon_url to clans table
ALTER TABLE clans ADD COLUMN IF NOT EXISTS guild_icon_url TEXT;

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('007_guild_icon.sql');