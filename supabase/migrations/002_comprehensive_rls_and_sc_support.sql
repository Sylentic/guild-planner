-- Migration: 002_comprehensive_rls_and_sc_support
-- Purpose: Comprehensive RLS fix + Star Citizen game support
-- Date: 2026-02-11
-- Description: 
--   1. Adds Star Citizen event types to event_type enum
--   2. Fixes ALL RLS policies to respect application-layer permissions system
--   3. Adds missing DELETE policy for groups table
--
-- Design Philosophy:
--   - RLS ensures GROUP MEMBERSHIP only (prevents cross-group data access)
--   - Application layer enforces FINE-GRAINED PERMISSIONS via permissions system
--   - This allows flexible role customization without database schema changes

-- =====================================================
-- PART 1: STAR CITIZEN EVENT TYPES
-- =====================================================

-- Add new Star Citizen event types to the event_type ENUM
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'missions';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'salvaging';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pirating';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'bounty_hunting';

-- Update comment to reflect all available event types
COMMENT ON TYPE event_type IS 'Event types: raid, siege, gathering, social, farming_glint, farming_materials, farming_gear, farming_other, missions, salvaging, pirating, bounty_hunting, other';

-- =====================================================
-- PART 2: GROUPS TABLE - MISSING DELETE POLICY
-- =====================================================

CREATE POLICY "Admin can delete group" ON groups
  FOR DELETE
  USING (user_has_clan_role(id, auth.uid(), ARRAY['admin']));

COMMENT ON POLICY "Admin can delete group" ON groups IS 'Only group admins can delete their groups';

-- =====================================================
-- PART 3: COMPREHENSIVE RLS POLICY FIXES
-- =====================================================

-- -----------------------------------------------------
-- EVENTS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers+ can create events" ON events;
DROP POLICY IF EXISTS "Officers+ can update events" ON events;
DROP POLICY IF EXISTS "Officers+ can delete events" ON events;

CREATE POLICY "Group members can create events"
  ON events FOR INSERT
  WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can update events"
  ON events FOR UPDATE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can delete events"
  ON events FOR DELETE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE events IS 'Events table with RLS ensuring group membership. Fine-grained permissions (events_create, events_edit_own, events_edit_any, events_delete_own, events_delete_any) are enforced by the application layer.';

-- -----------------------------------------------------
-- ANNOUNCEMENTS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers+ can create announcements" ON announcements;
DROP POLICY IF EXISTS "Officers+ can update announcements" ON announcements;
DROP POLICY IF EXISTS "Officers+ can delete announcements" ON announcements;

CREATE POLICY "Group members can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can update announcements"
  ON announcements FOR UPDATE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can delete announcements"
  ON announcements FOR DELETE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE announcements IS 'Announcements with RLS ensuring group membership. Permissions (announcements_create, announcements_edit, announcements_delete) enforced by application layer.';

-- -----------------------------------------------------
-- PARTIES
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can manage parties" ON parties;

CREATE POLICY "Group members can manage parties"
  ON parties FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE parties IS 'Parties with RLS ensuring group membership. Permissions (parties_create, parties_edit_own, parties_edit_any, parties_delete_own, parties_delete_any) enforced by application layer.';

-- -----------------------------------------------------
-- PARTY ROSTER
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can manage roster" ON party_roster;

CREATE POLICY "Group members can manage roster"
  ON party_roster FOR ALL
  USING (
    user_has_clan_role(
      (SELECT group_id FROM parties WHERE id = party_roster.party_id),
      auth.uid(),
      ARRAY['admin', 'officer', 'member', 'trial']
    )
  );

COMMENT ON TABLE party_roster IS 'Party roster with RLS ensuring group membership via party lookup.';

-- -----------------------------------------------------
-- MEMBERS (CHARACTERS)
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admin/Officer manage members" ON members;
DROP POLICY IF EXISTS "Admin/Officer update members" ON members;
DROP POLICY IF EXISTS "Admin/Officer delete members" ON members;

CREATE POLICY "Group members can create characters"
  ON members FOR INSERT
  WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can update characters"
  ON members FOR UPDATE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can delete characters"
  ON members FOR DELETE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE members IS 'Characters with RLS ensuring group membership. Permissions (characters_create, characters_edit_own, characters_edit_any, characters_delete_own, characters_delete_any) enforced by application layer.';

-- -----------------------------------------------------
-- MEMBER PROFESSIONS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Modify professions" ON member_professions;

CREATE POLICY "Group members can modify professions"
  ON member_professions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_professions.member_id
      AND user_has_clan_role(m.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

COMMENT ON TABLE member_professions IS 'Member professions with RLS ensuring group membership via member lookup. Application enforces edit permissions.';

-- -----------------------------------------------------
-- SIEGE EVENTS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can manage sieges" ON siege_events;

CREATE POLICY "Group members can manage sieges"
  ON siege_events FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE siege_events IS 'Siege events with RLS ensuring group membership. Permissions (siege_create_event, siege_edit_rosters) enforced by application layer.';

-- -----------------------------------------------------
-- GUILD BANKS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can manage bank" ON guild_banks;

CREATE POLICY "Group members can manage bank"
  ON guild_banks FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE guild_banks IS 'Guild banks with RLS ensuring group membership. Permissions (guild_bank_manage) enforced by application layer.';

-- -----------------------------------------------------
-- BANK INVENTORY
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can manage inventory" ON bank_inventory;

CREATE POLICY "Group members can manage inventory"
  ON bank_inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = bank_inventory.bank_id
      AND user_has_clan_role(gb.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

COMMENT ON TABLE bank_inventory IS 'Bank inventory with RLS ensuring group membership. Permissions (guild_bank_deposit, guild_bank_withdraw) enforced by application layer.';

-- -----------------------------------------------------
-- BANK TRANSACTIONS (Keep existing - already allows members)
-- -----------------------------------------------------
COMMENT ON TABLE bank_transactions IS 'Bank transactions with RLS ensuring group membership. All members can create deposits, withdrawals enforced by application layer via guild_bank_withdraw permission.';

-- -----------------------------------------------------
-- RESOURCE REQUESTS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can review requests" ON resource_requests;

CREATE POLICY "Group members can review requests"
  ON resource_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guild_banks gb
      WHERE gb.id = resource_requests.bank_id
      AND user_has_clan_role(gb.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

COMMENT ON TABLE resource_requests IS 'Resource requests with RLS ensuring group membership. Application enforces review permissions.';

-- -----------------------------------------------------
-- RECRUITMENT APPLICATIONS
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Officers can view applications" ON recruitment_applications;
DROP POLICY IF EXISTS "Officers can update applications" ON recruitment_applications;

CREATE POLICY "Group members can view applications"
  ON recruitment_applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
  );

CREATE POLICY "Group members can update applications"
  ON recruitment_applications FOR UPDATE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE recruitment_applications IS 'Recruitment applications with RLS ensuring group membership or own application. Permission (recruitment_manage) enforced by application layer.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

INSERT INTO migration_history (filename) VALUES ('002_comprehensive_rls_and_sc_support.sql');
