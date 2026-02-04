-- Add per-game welcome message toggles
-- Allows enabling/disabling welcome messages independently for each game

-- Add welcome message enable columns for each game
ALTER TABLE groups ADD COLUMN IF NOT EXISTS aoc_welcome_enabled BOOLEAN DEFAULT true;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_welcome_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN groups.aoc_welcome_enabled IS 'Enable welcome messages for AoC members';
COMMENT ON COLUMN groups.sc_welcome_enabled IS 'Enable welcome messages for Star Citizen members';

-- Update migration history
INSERT INTO migration_history (filename) VALUES ('057_add_welcome_message_toggles.sql') ON CONFLICT DO NOTHING;
