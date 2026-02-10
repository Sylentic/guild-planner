-- =====================================================
-- Standardize Star Citizen Game Slug
-- =====================================================
-- Ensure all Star Citizen references use 'starcitizen' consistently

-- Update game_types if needed
UPDATE game_types
SET id = 'starcitizen'
WHERE id = 'star-citizen';

-- Delete old 'star-citizen' entries from group_games where 'starcitizen' already exists
DELETE FROM group_games
WHERE game_slug = 'star-citizen' 
AND group_id IN (
  SELECT group_id FROM group_games WHERE game_slug = 'starcitizen'
);

-- Update remaining group_games with old slug
UPDATE group_games
SET game_slug = 'starcitizen'
WHERE game_slug = 'star-citizen';

-- Update members if any have old slug
UPDATE members
SET game_slug = 'starcitizen'
WHERE game_slug = 'star-citizen';

-- Update events if any have old slug
UPDATE events
SET game_slug = 'starcitizen'
WHERE game_slug = 'star-citizen';

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('060_standardize_starcitizen_slug.sql') ON CONFLICT DO NOTHING;
