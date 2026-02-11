-- Migration: 003_relax_events_rls_for_permissions
-- Purpose: Relax RLS policies to allow application-layer permissions to work
-- Date: 2026-02-11
-- Description: Changes events RLS policies to allow any group member to create/modify events.
--              The application layer will enforce fine-grained permissions (events_create, events_edit, etc)
--              RLS still ensures users can only interact with their group's events.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Officers+ can create events" ON events;
DROP POLICY IF EXISTS "Officers+ can update events" ON events;
DROP POLICY IF EXISTS "Officers+ can delete events" ON events;

-- Create relaxed policies that allow any member (application enforces permissions)
CREATE POLICY "Group members can create events"
  ON events FOR INSERT
  WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can update events"
  ON events FOR UPDATE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Group members can delete events"
  ON events FOR DELETE
  USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

-- Add comment explaining the design
COMMENT ON TABLE events IS 'Events table with RLS ensuring group membership. Fine-grained permissions (events_create, events_edit, events_delete) are enforced by the application layer via the permissions system.';

-- Record migration in history
INSERT INTO migration_history (filename) VALUES ('003_relax_events_rls_for_permissions.sql');
