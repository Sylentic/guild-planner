-- =====================================================
-- Fix infinite recursion in clan_members RLS policies
-- AND optimize parties/events policies to use SECURITY DEFINER
-- =====================================================

-- =====================================================
-- CLAN_MEMBERS POLICIES (fix recursion)
-- =====================================================

-- Drop ALL existing policies on clan_members to start fresh
DROP POLICY IF EXISTS "Users can view own membership" ON clan_members;
DROP POLICY IF EXISTS "Clan managers can view members" ON clan_members;
DROP POLICY IF EXISTS "Anyone can apply to clan" ON clan_members;
DROP POLICY IF EXISTS "Creator becomes admin" ON clan_members;
DROP POLICY IF EXISTS "Admin/Officer manage memberships" ON clan_members;
DROP POLICY IF EXISTS "Admin can remove or user can leave" ON clan_members;
-- New policy names
DROP POLICY IF EXISTS "clan_members_select" ON clan_members;
DROP POLICY IF EXISTS "clan_members_insert_pending" ON clan_members;
DROP POLICY IF EXISTS "clan_members_insert_creator" ON clan_members;
DROP POLICY IF EXISTS "clan_members_update" ON clan_members;
DROP POLICY IF EXISTS "clan_members_delete" ON clan_members;

-- SELECT: Anyone can view clan_members (public visibility)
CREATE POLICY "clan_members_select"
ON clan_members FOR SELECT
USING (true);

-- INSERT: Authenticated users can insert their own membership as pending
CREATE POLICY "clan_members_insert_pending"
ON clan_members FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid() 
  AND role = 'pending'
);

-- INSERT: Allow creator to become admin when creating a clan
CREATE POLICY "clan_members_insert_creator"
ON clan_members FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid() 
  AND role = 'admin'
  AND is_creator = TRUE
);

-- UPDATE: Use SECURITY DEFINER function (bypasses RLS)
CREATE POLICY "clan_members_update"
ON clan_members FOR UPDATE
USING (
  user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
);

-- DELETE: Users can leave, admins can remove
CREATE POLICY "clan_members_delete"
ON clan_members FOR DELETE
USING (
  user_id = auth.uid()
  OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin'])
);

-- =====================================================
-- PARTIES POLICIES (optimize using SECURITY DEFINER)
-- =====================================================

DROP POLICY IF EXISTS "Clan members can view parties" ON parties;
DROP POLICY IF EXISTS "Officers can manage parties" ON parties;

-- SELECT: Use SECURITY DEFINER function (bypasses RLS on clan_members)
CREATE POLICY "Clan members can view parties"
ON parties FOR SELECT
USING (
  user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
);

-- ALL: Officers+ can manage
CREATE POLICY "Officers can manage parties"
ON parties FOR ALL
USING (
  user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
);

-- =====================================================
-- PARTY_ROSTER POLICIES (optimize using SECURITY DEFINER)
-- =====================================================

DROP POLICY IF EXISTS "Clan members can view roster" ON party_roster;
DROP POLICY IF EXISTS "Officers can manage roster" ON party_roster;

-- SELECT: Use SECURITY DEFINER via parties join
CREATE POLICY "Clan members can view roster"
ON party_roster FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parties p
    WHERE p.id = party_roster.party_id
    AND user_has_clan_role(p.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
  )
);

-- ALL: Officers can manage
CREATE POLICY "Officers can manage roster"
ON party_roster FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM parties p
    WHERE p.id = party_roster.party_id
    AND user_has_clan_role(p.clan_id, auth.uid(), ARRAY['admin', 'officer'])
  )
);

-- =====================================================
-- RECRUITMENT_APPLICATIONS POLICIES (optimize)
-- =====================================================

DROP POLICY IF EXISTS "Officers can manage applications" ON recruitment_applications;
DROP POLICY IF EXISTS "Officers can update applications" ON recruitment_applications;

-- SELECT: Officers can manage OR own applications
CREATE POLICY "Officers can manage applications"
ON recruitment_applications FOR SELECT
USING (
  user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  OR user_id = auth.uid()
);

-- UPDATE: Officers only
CREATE POLICY "Officers can update applications"
ON recruitment_applications FOR UPDATE
USING (
  user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
);

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('006_fix_rls_recursion.sql');
