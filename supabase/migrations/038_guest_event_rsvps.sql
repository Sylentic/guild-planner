-- Migration: Guest RSVP table for allies not yet in the system
-- Purpose: Allow allied clan members to RSVP without having an account

CREATE TABLE guest_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  allied_clan_id UUID NOT NULL REFERENCES clans(id),
  guest_name VARCHAR(255) NOT NULL,
  class_id UUID,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one RSVP per guest per event
  UNIQUE(event_id, allied_clan_id, guest_name)
);

-- Create index for faster queries
CREATE INDEX idx_guest_event_rsvps_event ON guest_event_rsvps(event_id);
CREATE INDEX idx_guest_event_rsvps_allied_clan ON guest_event_rsvps(allied_clan_id);

-- Enable RLS
ALTER TABLE guest_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Clan members can view guest RSVPs for their events
CREATE POLICY "Members can view guest RSVPs"
  ON guest_event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
      AND user_in_clan_or_allied_clan(e.clan_id, auth.uid())
    )
  );

-- Policy: Allow inserts via API (validated server-side)
-- We use a permissive policy since validation happens in the API
CREATE POLICY "API can create guest RSVPs"
  ON guest_event_rsvps FOR INSERT
  WITH CHECK (true);

-- Policy: Members can update guest RSVPs (admins only)
CREATE POLICY "Admins can manage guest RSVPs"
  ON guest_event_rsvps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Policy: Admins can delete guest RSVPs
CREATE POLICY "Admins can delete guest RSVPs"
  ON guest_event_rsvps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('038_guest_event_rsvps.sql');
