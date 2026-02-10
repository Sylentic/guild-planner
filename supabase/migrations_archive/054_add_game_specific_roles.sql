-- Add game-specific role and channel support for announcements/events
-- Supports separate announcement channels and roles for different games (e.g., Star Citizen)

-- Add columns to groups table for game-specific announcement roles
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS sc_announcement_role_id TEXT,
ADD COLUMN IF NOT EXISTS sc_events_role_id TEXT;

-- Add comments
COMMENT ON COLUMN groups.sc_announcement_role_id IS 'Star Citizen: Discord role ID to ping for announcements';
COMMENT ON COLUMN groups.sc_events_role_id IS 'Star Citizen: Discord role ID to ping for events';

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('054_add_game_specific_roles.sql') ON CONFLICT DO NOTHING;