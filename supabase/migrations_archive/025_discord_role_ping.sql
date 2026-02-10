-- =====================================================
-- Add Discord Role Ping for Announcements
-- Allows pinging a specific Discord role when announcements are posted
-- =====================================================

-- Add role ID field to clans table
ALTER TABLE clans ADD COLUMN IF NOT EXISTS discord_announcement_role_id TEXT;

-- Add comment
COMMENT ON COLUMN clans.discord_announcement_role_id IS 'Discord role ID to ping when posting announcements (numeric ID only)';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('025_discord_role_ping.sql');
