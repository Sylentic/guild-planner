-- Allow one main character per user per game per group
-- Replaces global-per-user uniqueness with per-game, per-group constraint

-- Drop old index
DROP INDEX IF EXISTS idx_members_one_main_per_user;

-- Create new unique partial index scoped by group and game
CREATE UNIQUE INDEX idx_members_one_main_per_user_game
  ON members(group_id, user_id, game_slug)
  WHERE is_main = TRUE AND user_id IS NOT NULL;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('064_main_character_per_game.sql') ON CONFLICT DO NOTHING;
