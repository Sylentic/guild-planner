-- =====================================================
-- Add RoR Discord Webhooks and Game-Specific Roles
-- =====================================================
-- Extend Discord integration to support Return of Reckoning
-- and make roles/webhooks fully game-specific

ALTER TABLE groups ADD COLUMN IF NOT EXISTS ror_webhook_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS ror_events_webhook_url TEXT;

-- Add game-specific role IDs for announcements and events
ALTER TABLE groups ADD COLUMN IF NOT EXISTS aoc_announcement_role_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS aoc_events_role_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_announcement_role_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_events_role_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS ror_announcement_role_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS ror_events_role_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN groups.ror_webhook_url IS 'Discord webhook URL for RoR announcements and general notifications';
COMMENT ON COLUMN groups.ror_events_webhook_url IS 'Discord webhook URL for RoR event notifications';
COMMENT ON COLUMN groups.aoc_announcement_role_id IS 'Discord role ID to ping for AoC announcements';
COMMENT ON COLUMN groups.aoc_events_role_id IS 'Discord role ID to ping for AoC event notifications';
COMMENT ON COLUMN groups.sc_announcement_role_id IS 'Discord role ID to ping for Star Citizen announcements';
COMMENT ON COLUMN groups.sc_events_role_id IS 'Discord role ID to ping for Star Citizen event notifications';
COMMENT ON COLUMN groups.ror_announcement_role_id IS 'Discord role ID to ping for RoR announcements';
COMMENT ON COLUMN groups.ror_events_role_id IS 'Discord role ID to ping for RoR event notifications';

-- Migrate existing role IDs to game-specific columns
UPDATE groups 
SET aoc_announcement_role_id = discord_announcement_role_id
WHERE discord_announcement_role_id IS NOT NULL AND aoc_announcement_role_id IS NULL;

UPDATE groups 
SET aoc_events_role_id = sc_events_role_id
WHERE sc_events_role_id IS NOT NULL AND aoc_events_role_id IS NULL;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('062_ror_discord_webhooks_and_roles.sql') ON CONFLICT DO NOTHING;
