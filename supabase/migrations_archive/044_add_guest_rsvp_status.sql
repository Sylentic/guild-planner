-- Migration: Add status to guest RSVPs
-- Purpose: Track confirmation status (attending/maybe) for guest signups

-- Add status column to guest_event_rsvps
ALTER TABLE guest_event_rsvps 
ADD COLUMN status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'declined'));

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('044_add_guest_rsvp_status.sql');
