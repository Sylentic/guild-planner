-- Add game_slug column to events table for game-specific events
ALTER TABLE events ADD COLUMN IF NOT EXISTS game_slug TEXT NOT NULL DEFAULT 'aoc';

-- Create index for faster lookups by game
CREATE INDEX IF NOT EXISTS idx_events_game_slug ON events(game_slug);

-- Create composite index for common queries (group + game)
CREATE INDEX IF NOT EXISTS idx_events_group_game ON events(group_id, game_slug);

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('050_add_game_to_events.sql') ON CONFLICT DO NOTHING;
