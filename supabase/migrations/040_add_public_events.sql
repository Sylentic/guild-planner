-- Migration: Add public event support
-- Purpose: Allow clans to mark events as public for unauthenticated guest access

-- =====================================================
-- ADD PUBLIC FLAG TO EVENTS
-- =====================================================

ALTER TABLE events ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- =====================================================
-- ADD EMAIL FIELD FOR ANONYMOUS GUESTS
-- =====================================================

ALTER TABLE guest_event_rsvps ADD COLUMN guest_email VARCHAR(255);

-- Add unique constraint for anonymous guests (email + event)
ALTER TABLE guest_event_rsvps 
ADD CONSTRAINT guest_rsvp_unique_anonymous UNIQUE NULLS NOT DISTINCT (event_id, guest_email);

-- =====================================================
-- UPDATE RLS POLICIES FOR PUBLIC EVENTS
-- =====================================================

-- Allow anonymous users to view public events
DROP POLICY IF EXISTS "Clan members can view events" ON events;
CREATE POLICY "Clan members and public can view events"
  ON events FOR SELECT
  USING (
    is_public = TRUE
    OR user_in_clan_or_allied_clan(clan_id, auth.uid())
  );

-- Allow anonymous users to insert guest RSVPs on public events
DROP POLICY IF EXISTS "Insert guest RSVPs" ON guest_event_rsvps;
CREATE POLICY "Anyone can RSVP to public events as guest"
  ON guest_event_rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = guest_event_rsvps.event_id
      AND e.is_public = TRUE
    )
  );

-- Keep view access for authenticated users via allied clans
CREATE POLICY "Allied members can view guest RSVPs"
  ON guest_event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = guest_event_rsvps.event_id
      AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('040_add_public_events.sql');
