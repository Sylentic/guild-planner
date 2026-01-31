-- Migration: Allow public viewing of RSVPs on public events
-- Purpose: Allow unauthenticated users to see attendance counts for public events

-- =====================================================
-- ADD RLS POLICY FOR PUBLIC EVENT RSVP VIEWING
-- =====================================================

-- Allow anyone (including anonymous) to view RSVPs for public events
CREATE POLICY "Anyone can view RSVPs for public events"
  ON event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_rsvps.event_id
      AND e.is_public = TRUE
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('042_allow_public_event_rsvp_view.sql');
