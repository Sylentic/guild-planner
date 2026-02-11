-- Migration: 003_fix_event_rsvps_policies
-- Purpose: Fix missing event_rsvps RLS policies
-- Date: 2026-02-11
-- Description: The baseline squashing accidentally dropped these policies without recreating them.
--              Migration 036 dropped them but never recreated them, leaving event_rsvps
--              with only SELECT and DELETE policies, breaking all RSVPs.
--
-- Design: RLS ensures GROUP MEMBERSHIP only (via event lookup).
--         Application enforces who can RSVP for whom (own vs on behalf of others).

-- Recreate the missing INSERT policy
CREATE POLICY "Group members can create RSVPs"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

-- Recreate the missing UPDATE policy  
CREATE POLICY "Group members can update RSVPs"
  ON event_rsvps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

COMMENT ON TABLE event_rsvps IS 'Event RSVPs with RLS ensuring group membership only. Application enforces RSVP permissions (own vs on behalf of others).';

-- Record migration in history
INSERT INTO migration_history (filename) VALUES ('003_fix_event_rsvps_policies.sql');
