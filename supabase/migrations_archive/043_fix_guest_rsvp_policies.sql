-- Migration: Fix guest RSVP for public events
-- Purpose: Allow public guests to RSVP without an allied clan

-- =====================================================
-- MAKE ALLIED_CLAN_ID NULLABLE FOR PUBLIC GUESTS
-- =====================================================

-- Make allied_clan_id nullable so public guests can sign up without a clan
ALTER TABLE guest_event_rsvps ALTER COLUMN allied_clan_id DROP NOT NULL;

-- Drop the foreign key constraint and recreate it as deferrable
ALTER TABLE guest_event_rsvps DROP CONSTRAINT guest_event_rsvps_allied_clan_id_fkey;
ALTER TABLE guest_event_rsvps 
ADD CONSTRAINT guest_event_rsvps_allied_clan_id_fkey 
FOREIGN KEY (allied_clan_id) REFERENCES clans(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- Update unique constraint to allow NULL allied_clan_id for public guests
ALTER TABLE guest_event_rsvps DROP CONSTRAINT guest_rsvp_unique_anonymous;
ALTER TABLE guest_event_rsvps 
ADD CONSTRAINT guest_rsvp_unique_anonymous UNIQUE NULLS NOT DISTINCT (event_id, guest_email, allied_clan_id);

-- =====================================================
-- DISABLE RLS (validation happens at application layer)
-- =====================================================

-- Disable RLS since we validate at the application layer
ALTER TABLE guest_event_rsvps DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MAKE GUEST_EMAIL NULLABLE
-- =====================================================

-- Email is optional for public guests
ALTER TABLE guest_event_rsvps ALTER COLUMN guest_email DROP NOT NULL;

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('043_fix_guest_rsvp_policies.sql');
