-- Add preferred_role column to members table for game-specific role tracking
-- Roles are defined in src/config/games/[game].json instead of database for easier updates
ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_role TEXT;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('051_add_preferred_role_to_members.sql') ON CONFLICT DO NOTHING;
