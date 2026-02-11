-- Migration: 004_comprehensive_rls_permissions_fix
-- Purpose: Fix ALL RLS policies to respect application-layer permissions system
-- Date: 2026-02-11
-- Description: Updates RLS policies across all tables to allow member-level access.
--              Application layer enforces fine-grained permissions via permissions system.
--              RLS only ensures group membership to prevent cross-group data access.

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================
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

-- =====================================================
-- PARTIES
-- =====================================================
DROP POLICY IF EXISTS "Officers can manage parties" ON parties;

CREATE POLICY "Group members can manage parties"
  ON parties FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE parties IS 'Parties with RLS ensuring group membership. Permissions (parties_create, parties_edit_own, parties_edit_any, parties_delete_own, parties_delete_any) enforced by application layer.';

-- =====================================================
-- PARTY ROSTER
-- =====================================================
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

-- =====================================================
-- MEMBERS (CHARACTERS)
-- =====================================================
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

-- =====================================================
-- MEMBER PROFESSIONS
-- =====================================================
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

-- =====================================================
-- SIEGE EVENTS
-- =====================================================
DROP POLICY IF EXISTS "Officers can manage sieges" ON siege_events;

CREATE POLICY "Group members can manage sieges"
  ON siege_events FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE siege_events IS 'Siege events with RLS ensuring group membership. Permissions (siege_create_event, siege_edit_rosters) enforced by application layer.';

-- =====================================================
-- GUILD BANKS
-- =====================================================
DROP POLICY IF EXISTS "Officers can manage bank" ON guild_banks;

CREATE POLICY "Group members can manage bank"
  ON guild_banks FOR ALL
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

COMMENT ON TABLE guild_banks IS 'Guild banks with RLS ensuring group membership. Permissions (guild_bank_manage) enforced by application layer.';

-- =====================================================
-- BANK INVENTORY
-- =====================================================
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

-- =====================================================
-- BANK TRANSACTIONS (Keep existing - already allows members)
-- =====================================================
COMMENT ON TABLE bank_transactions IS 'Bank transactions with RLS ensuring group membership. All members can create deposits, withdrawals enforced by application layer via guild_bank_withdraw permission.';

-- =====================================================
-- RESOURCE REQUESTS
-- =====================================================
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

-- =====================================================
-- RECRUITMENT APPLICATIONS
-- =====================================================
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

-- Record migration in history
INSERT INTO migration_history (filename) VALUES ('004_comprehensive_rls_permissions_fix.sql');
