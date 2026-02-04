-- Add guild_rank column to group_members table for game-specific rank assignment
-- Ranks are assigned per-user (like role), and defined in src/config/games/[game].json
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS guild_rank TEXT;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('052_add_guild_rank_to_members.sql') ON CONFLICT DO NOTHING;
