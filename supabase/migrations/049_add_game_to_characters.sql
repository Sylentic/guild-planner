-- Add game_slug column to members table for game-specific characters
ALTER TABLE members ADD COLUMN IF NOT EXISTS game_slug TEXT NOT NULL DEFAULT 'aoc';

-- Create index for faster lookups by game
CREATE INDEX IF NOT EXISTS idx_members_game_slug ON members(game_slug);

-- Create composite index for common queries (group + game)
CREATE INDEX IF NOT EXISTS idx_members_group_game ON members(group_id, game_slug);

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('049_add_game_to_characters.sql') ON CONFLICT DO NOTHING;
