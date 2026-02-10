-- Add game-specific Discord webhook URLs to groups table
-- Allows different games to have different notification webhooks

ALTER TABLE groups ADD COLUMN IF NOT EXISTS aoc_webhook_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS aoc_events_webhook_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_webhook_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_events_webhook_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN groups.aoc_webhook_url IS 'Discord webhook URL for AoC announcements and general notifications';
COMMENT ON COLUMN groups.aoc_events_webhook_url IS 'Discord webhook URL for AoC event notifications';
COMMENT ON COLUMN groups.sc_webhook_url IS 'Discord webhook URL for Star Citizen announcements and general notifications';
COMMENT ON COLUMN groups.sc_events_webhook_url IS 'Discord webhook URL for Star Citizen event notifications';

-- Update existing groups to use old webhook URL for AoC if it exists
UPDATE groups 
SET aoc_webhook_url = group_webhook_url,
    aoc_events_webhook_url = group_webhook_url
WHERE group_webhook_url IS NOT NULL AND aoc_webhook_url IS NULL;

-- Update migration history
INSERT INTO migration_history (filename) VALUES ('055_add_game_specific_webhooks.sql') ON CONFLICT DO NOTHING;
