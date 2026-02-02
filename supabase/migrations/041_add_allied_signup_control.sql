-- Migration: Add allied member signup control
-- Purpose: Allow event creators to control whether allied members can sign up for events

-- =====================================================
-- ADD ALLIED SIGNUP CONTROL TO EVENTS
-- =====================================================

ALTER TABLE events ADD COLUMN allow_allied_signups BOOLEAN DEFAULT TRUE;

-- =====================================================
-- UPDATE RLS POLICIES FOR ALLIED SIGNUP CONTROL
-- =====================================================

-- Update allied clan RSVP policy to check the allow_allied_signups flag
DROP POLICY IF EXISTS "Allied clan members can RSVP to events" ON event_rsvps;
CREATE POLICY "Allied clan members can RSVP to events"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_rsvps.event_id
      AND e.allow_allied_signups = TRUE
      AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('041_add_allied_signup_control.sql');
