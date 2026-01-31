-- Migration: Fix guest RSVP RLS policies
-- Purpose: Ensure only public events and API-validated inserts are allowed

-- =====================================================
-- DROP OLD PERMISSIVE POLICY
-- =====================================================

-- Drop the old "API can create guest RSVPs" policy that allowed everything
DROP POLICY IF EXISTS "API can create guest RSVPs" ON guest_event_rsvps;

-- =====================================================
-- ADD UPDATED INSERT POLICIES
-- =====================================================

-- Allow anonymous users to insert guest RSVPs on public events
CREATE POLICY "Anyone can RSVP to public events as guest"
  ON guest_event_rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = guest_event_rsvps.event_id
      AND e.is_public = TRUE
    )
  );

-- Allow authenticated members to insert guest RSVPs for their clan's events
CREATE POLICY "Members can add guest RSVPs for their clan"
  ON guest_event_rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = guest_event_rsvps.event_id
      AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('043_fix_guest_rsvp_policies.sql');
