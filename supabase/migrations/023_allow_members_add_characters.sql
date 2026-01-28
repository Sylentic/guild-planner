-- =====================================================
-- Allow Regular Members to Add Characters
-- Updates RLS policies so all approved clan members can add characters
-- =====================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admin/Officer manage members" ON members;

-- Create new policy that allows any approved member to insert characters
CREATE POLICY "Approved members can add characters" ON members
  FOR INSERT WITH CHECK (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
  );

-- Also update the member_professions policy to allow members to manage their own character's professions
DROP POLICY IF EXISTS "Modify professions" ON member_professions;

-- Allow members to modify professions for their own characters
CREATE POLICY "Members can modify own character professions" ON member_professions
  FOR ALL USING (
    member_id IN (
      SELECT m.id FROM members m
      WHERE m.user_id = auth.uid() 
         OR user_has_clan_role(m.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Update policy: members can update their own characters, officers/admins can update all
DROP POLICY IF EXISTS "Admin/Officer update members" ON members;

CREATE POLICY "Members can update own characters" ON members
  FOR UPDATE USING (
    user_id = auth.uid() OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- Delete policy: members can delete their own characters, officers/admins can delete all
DROP POLICY IF EXISTS "Admin/Officer delete members" ON members;

CREATE POLICY "Members can delete own characters" ON members
  FOR DELETE USING (
    user_id = auth.uid() OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );
