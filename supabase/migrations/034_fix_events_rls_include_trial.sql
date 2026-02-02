-- Migration: Fix event RLS policies to include trial members
-- Purpose: Trial members should be able to view events and RSVP, just like regular members

-- Drop and recreate the "Clan members can view events" policy
DROP POLICY IF EXISTS "Clan members can view events" ON events;
CREATE POLICY "Clan members can view events"
  ON events FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

-- Drop and recreate the "Clan members can view RSVPs" policy
DROP POLICY IF EXISTS "Clan members can view RSVPs" ON event_rsvps;
CREATE POLICY "Clan members can view RSVPs"
  ON event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

-- Drop and recreate the "Members can RSVP" policy
DROP POLICY IF EXISTS "Members can RSVP" ON event_rsvps;
CREATE POLICY "Members can RSVP"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('034_fix_events_rls_include_trial.sql');
