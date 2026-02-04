-- =====================================================
-- Add Multi-Game Support
-- =====================================================
-- Migration: 034_add_game_support

-- Add game column to clans table
ALTER TABLE clans ADD COLUMN game VARCHAR(50) DEFAULT 'aoc' NOT NULL;

-- Add constraint for valid games
ALTER TABLE clans ADD CONSTRAINT valid_game CHECK (game IN ('aoc', 'starcitizen'));

-- Create game types enum equivalent
CREATE TABLE IF NOT EXISTS game_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed game types
INSERT INTO game_types (id, name, description, icon) VALUES
  ('aoc', 'Ashes of Creation', 'Guild profession planning and coordination', '⚔️'),
  ('starcitizen', 'Star Citizen', 'Fleet management and pilot coordination', '🚀')
ON CONFLICT (id) DO NOTHING;

-- Create user_games table to track which games a user participates in
CREATE TABLE IF NOT EXISTS user_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game VARCHAR(50) REFERENCES game_types(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game)
);

CREATE INDEX idx_user_games_user_id ON user_games(user_id);
CREATE INDEX idx_user_games_game ON user_games(game);

-- Create index on clans.game for faster filtering
CREATE INDEX idx_clans_game ON clans(game);

INSERT INTO migration_history (filename) VALUES ('045_add_game_support.sql');