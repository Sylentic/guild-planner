-- Add archived column to group_games table
-- This allows groups to archive games without deleting any data

ALTER TABLE group_games ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN group_games.archived IS 'Whether this game is archived for the group. Archived games are hidden from the UI and prevent updates but preserve all data.';

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('067_add_group_games_archived.sql') ON CONFLICT DO NOTHING;
