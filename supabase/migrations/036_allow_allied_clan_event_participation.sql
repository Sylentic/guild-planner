-- Migration: Allow allied clan members to view and RSVP to clan events
-- Purpose: Enable members from allied clans to participate in events, even if not in the system

-- =====================================================
-- HELPER FUNCTION
-- =====================================================

-- Function to check if user is in the event's clan OR in an allied clan
CREATE OR REPLACE FUNCTION user_in_clan_or_allied_clan(check_clan_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- User is in the event's clan
    SELECT 1 FROM clan_members 
    WHERE clan_id = check_clan_id 
    AND user_id = check_user_id
  ) OR EXISTS (
    -- User is in a clan allied with the event's clan
    SELECT 1 FROM clan_members cm
    INNER JOIN alliance_members am ON cm.clan_id = am.clan_id
    INNER JOIN alliance_members am2 ON am.alliance_id = am2.alliance_id
    WHERE am2.clan_id = check_clan_id
    AND cm.user_id = check_user_id
    AND am.status = 'approved'
    AND am2.status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Update "Clan members can view events" to include allied clan members
DROP POLICY IF EXISTS "Clan members can view events" ON events;
CREATE POLICY "Clan members can view events"
  ON events FOR SELECT
  USING (user_in_clan_or_allied_clan(clan_id, auth.uid()));

-- Update "Clan members can view RSVPs" to include allied clan members
DROP POLICY IF EXISTS "Clan members can view RSVPs" ON event_rsvps;
CREATE POLICY "Clan members can view RSVPs"
  ON event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
    )
  );

-- Update "Members can RSVP" to include allied clan members
DROP POLICY IF EXISTS "Members can RSVP" ON event_rsvps;
CREATE POLICY "Members can RSVP"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    (
      -- Users can RSVP for themselves if they're in the clan or an allied clan
      auth.uid() = user_id AND
      EXISTS (
        SELECT 1 FROM events e 
        WHERE e.id = event_id 
        AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
      )
    ) OR (
      -- Admins/Officers of the event's clan can RSVP on behalf of members
      EXISTS (
        SELECT 1 FROM events e 
        WHERE e.id = event_id 
        AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer'])
        AND user_has_clan_role(e.clan_id, user_id, ARRAY['admin', 'officer', 'member', 'trial'])
      )
    )
  );

-- Update "Users can update own RSVP" to include allied members
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
INSERT INTO migration_history (filename) VALUES ('036_allow_allied_clan_event_participation.sql');
