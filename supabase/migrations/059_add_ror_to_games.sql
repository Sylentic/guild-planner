-- =====================================================
-- Add Return of Reckoning to Games Support
-- =====================================================

-- Add Return of Reckoning to game_types
INSERT INTO game_types (id, name, description, icon) VALUES
  ('ror', 'Return of Reckoning', 'Faction-based PvP and character management', '⚔️')
ON CONFLICT (id) DO NOTHING;

-- Update the CHECK constraint to include Return of Reckoning
ALTER TABLE groups DROP CONSTRAINT IF EXISTS valid_game;
ALTER TABLE groups ADD CONSTRAINT valid_game CHECK (game IN ('aoc', 'starcitizen', 'ror'));

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('059_add_ror_to_games.sql') ON CONFLICT DO NOTHING;
