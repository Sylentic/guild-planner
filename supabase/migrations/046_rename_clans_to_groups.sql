-- Rename clans to groups - comprehensive refactor
-- This migration renames all clan-related tables and columns to group terminology

-- 1. Rename clans table to groups
ALTER TABLE clans RENAME TO groups;

-- 2. Rename clan_members to group_members
ALTER TABLE clan_members RENAME TO group_members;

-- 3. Rename clan_achievements to group_achievements
ALTER TABLE clan_achievements RENAME TO group_achievements;

-- 4. Update column names in groups table
ALTER TABLE groups RENAME COLUMN guild_icon_url TO group_icon_url;
ALTER TABLE groups RENAME COLUMN discord_webhook_url TO group_webhook_url;
ALTER TABLE groups RENAME COLUMN discord_welcome_webhook_url TO group_welcome_webhook_url;

-- 5. Update foreign key columns in group_members
ALTER TABLE group_members RENAME COLUMN clan_id TO group_id;

-- 6. Update foreign key columns in group_achievements
ALTER TABLE group_achievements RENAME COLUMN clan_id TO group_id;

-- 7. Rename indexes
ALTER INDEX idx_clans_game RENAME TO idx_groups_game;
ALTER INDEX idx_clan_members_user_id RENAME TO idx_group_members_user_id;
ALTER INDEX idx_clan_members_clan_id RENAME TO idx_group_members_group_id;
ALTER INDEX idx_clan_achievements_clan RENAME TO idx_group_achievements_group;

-- 8. Update foreign key columns in other tables that reference clans
-- Note: Only renaming columns in tables that definitely exist based on migrations
ALTER TABLE events RENAME COLUMN clan_id TO group_id;
ALTER TABLE parties RENAME COLUMN clan_id TO group_id;
ALTER TABLE freeholds RENAME COLUMN clan_id TO group_id;
ALTER TABLE guild_bank_transactions RENAME COLUMN clan_id TO group_id;
ALTER TABLE caravan_events RENAME COLUMN clan_id TO group_id;
ALTER TABLE activity_log RENAME COLUMN clan_id TO group_id;
ALTER TABLE announcements RENAME COLUMN clan_id TO group_id;
ALTER TABLE alliances RENAME COLUMN clan_id_1 TO group_id_1;
ALTER TABLE alliances RENAME COLUMN clan_id_2 TO group_id_2;
ALTER TABLE dkp_entries RENAME COLUMN clan_id TO group_id;
ALTER TABLE loot_entries RENAME COLUMN clan_id TO group_id;
ALTER TABLE recruitment_settings RENAME COLUMN clan_id TO group_id;
ALTER TABLE role_templates RENAME COLUMN clan_id TO group_id;
ALTER TABLE nodes RENAME COLUMN clan_id TO group_id;
ALTER TABLE clan_permission_overrides RENAME TO group_permission_overrides;
ALTER TABLE group_permission_overrides RENAME COLUMN clan_id TO group_id;

-- 9. Update guest_event_rsvps allied_clan_id column
ALTER TABLE guest_event_rsvps RENAME COLUMN allied_clan_id TO allied_group_id;

-- 10. Update constraint references
-- The foreign key constraints should auto-update, but we need to handle the constraint names
ALTER TABLE groups RENAME CONSTRAINT valid_game TO groups_valid_game;
