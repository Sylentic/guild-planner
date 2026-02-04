-- Migration: Allow admins and officers to RSVP on behalf of members
-- Purpose: Enable event organizers to register members who can't respond themselves

-- Drop and recreate the "Members can RSVP" policy to allow admins to RSVP for others
DROP POLICY IF EXISTS "Members can RSVP" ON event_rsvps;
CREATE POLICY "Members can RSVP"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    (
      -- Users can RSVP for themselves
      auth.uid() = user_id AND
      EXISTS (
        SELECT 1 FROM events e 
        WHERE e.id = event_id 
        AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
      )
    ) OR (
      -- Admins/Officers can RSVP on behalf of members
      EXISTS (
        SELECT 1 FROM events e 
        WHERE e.id = event_id 
        AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer'])
        AND user_has_clan_role(e.clan_id, user_id, ARRAY['admin', 'officer', 'member', 'trial'])
      )
    )
  );

-- Also update the UPDATE policy to allow admins to update RSVPs for members
DROP POLICY IF EXISTS "Users can update own RSVP" ON event_rsvps;
CREATE POLICY "Users can update own RSVP"
  ON event_rsvps FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('035_allow_admin_rsvp_on_behalf.sql');
