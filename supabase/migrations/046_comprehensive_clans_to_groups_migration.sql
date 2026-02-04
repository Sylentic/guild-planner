-- Comprehensive migration: Rename all clan references to group
-- This single migration handles:
-- 1. Table renames (clans -> groups, clan_members -> group_members, etc.)
-- 2. Column renames (clan_id -> group_id, etc.)
-- 3. Index renames
-- 4. Foreign key constraint updates
-- 5. Function recreation for group terminology
-- This replaces migrations 046-050

-- ============================================================================
-- PHASE 1: Rename main tables and columns
-- ============================================================================

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

-- 5b. Update foreign key columns in members table
ALTER TABLE members RENAME COLUMN clan_id TO group_id;

-- 6. Update foreign key columns in group_achievements
ALTER TABLE group_achievements RENAME COLUMN clan_id TO group_id;

-- 7. Rename indexes
ALTER INDEX idx_clans_game RENAME TO idx_groups_game;
ALTER INDEX idx_clan_members_user_id RENAME TO idx_group_members_user_id;
ALTER INDEX idx_clan_members_clan_id RENAME TO idx_group_members_group_id;
ALTER INDEX idx_clan_achievements_clan RENAME TO idx_group_achievements_group;
ALTER INDEX idx_members_clan_id RENAME TO idx_members_group_id;

-- 8. Update foreign key columns in other tables that reference clans
ALTER TABLE events RENAME COLUMN clan_id TO group_id;
ALTER TABLE parties RENAME COLUMN clan_id TO group_id;
ALTER TABLE freeholds RENAME COLUMN clan_id TO group_id;
ALTER TABLE guild_banks RENAME COLUMN clan_id TO group_id;
ALTER TABLE caravan_events RENAME COLUMN clan_id TO group_id;
ALTER TABLE activity_log RENAME COLUMN clan_id TO group_id;
ALTER TABLE announcements RENAME COLUMN clan_id TO group_id;
ALTER TABLE alliance_members RENAME COLUMN clan_id TO group_id;
ALTER TABLE alliances RENAME COLUMN leader_clan_id TO leader_group_id;
ALTER TABLE loot_systems RENAME COLUMN clan_id TO group_id;
ALTER TABLE clan_permission_overrides RENAME TO group_permission_overrides;
ALTER TABLE group_permission_overrides RENAME COLUMN clan_id TO group_id;
ALTER TABLE recruitment_applications RENAME COLUMN clan_id TO group_id;

-- 9. Update guest_event_rsvps allied_clan_id column
ALTER TABLE guest_event_rsvps RENAME COLUMN allied_clan_id TO allied_group_id;

-- 10. Update constraint references
ALTER TABLE groups RENAME CONSTRAINT valid_game TO groups_valid_game;

-- 10b. Fix foreign key constraint for guest_event_rsvps
ALTER TABLE guest_event_rsvps DROP CONSTRAINT IF EXISTS guest_event_rsvps_allied_clan_id_fkey;
ALTER TABLE guest_event_rsvps 
  ADD CONSTRAINT guest_event_rsvps_allied_group_id_fkey 
  FOREIGN KEY (allied_group_id) REFERENCES groups(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- ============================================================================
-- PHASE 2: Recreate functions with group terminology
-- ============================================================================

-- Drop old functions with CASCADE to handle dependent policies
DROP FUNCTION IF EXISTS user_in_clan_or_allied_clan(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_groups_allied(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_clan_role(UUID, UUID, text[]) CASCADE;

-- Recreate user_in_clan_or_allied_clan function
CREATE OR REPLACE FUNCTION user_in_clan_or_allied_clan(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    -- User is a member of the group
    SELECT 1 FROM group_members
    WHERE group_id = $1 AND user_id = $2
  )
  OR EXISTS(
    -- User is in an allied group
    SELECT 1 FROM alliances a
    JOIN alliance_members am1 ON a.id = am1.alliance_id AND am1.group_id = $1
    JOIN alliance_members am2 ON a.id = am2.alliance_id AND am2.group_id IN (
      SELECT group_id FROM group_members WHERE user_id = $2
    )
    WHERE am1.status = 'active' AND am2.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate check_groups_allied function
CREATE OR REPLACE FUNCTION check_groups_allied(group_a UUID, group_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM alliances a
    JOIN alliance_members am1 ON a.id = am1.alliance_id AND am1.group_id = group_a
    JOIN alliance_members am2 ON a.id = am2.alliance_id AND am2.group_id = group_b
    WHERE am1.status = 'active' AND am2.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate user_has_clan_role function (critical for all RLS policies)
CREATE OR REPLACE FUNCTION user_has_clan_role(
  check_group_id UUID,
  check_user_id UUID,
  allowed_roles text[]
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = check_group_id 
    AND user_id = check_user_id 
    AND role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO migration_history (filename) VALUES ('046_comprehensive_clans_to_groups_migration.sql') ON CONFLICT DO NOTHING;
