-- Migration 025: Add role-based requirements to events
-- Purpose: Allow events to have role requirements like parties
-- and track which role users are RSVPing for

-- Add role requirement columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS tanks_needed INT DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS healers_needed INT DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dps_needed INT DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS support_needed INT DEFAULT 0;

-- Add role column to event_rsvps to track which role user is attending as
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_role_check 
  CHECK (role IS NULL OR role IN ('tank', 'healer', 'dps', 'support'));

-- Add comments
COMMENT ON COLUMN events.tanks_needed IS 'Number of tanks needed for this event';
COMMENT ON COLUMN events.healers_needed IS 'Number of healers needed for this event';
COMMENT ON COLUMN events.dps_needed IS 'Number of DPS needed for this event';
COMMENT ON COLUMN events.support_needed IS 'Number of support players needed for this event';
COMMENT ON COLUMN event_rsvps.role IS 'Which role the user is attending as (tank, healer, dps, support)';

-- Note: max_attendees is kept for backward compatibility and general events without role requirements

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('027_event_role_requirements.sql');
