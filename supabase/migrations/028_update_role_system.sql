-- Migration 026: Update role system to use specific roles
-- Purpose: Replace generic role system with specific roles: tank, cleric, bard, ranged_dps, melee_dps
-- This affects both parties and events

-- =====================================================
-- PARTY ROLE UPDATES
-- =====================================================

-- Drop old constraint on party_roster
ALTER TABLE party_roster DROP CONSTRAINT IF EXISTS party_roster_role_check;

-- Update party_roster to use new roles
ALTER TABLE party_roster ADD CONSTRAINT party_roster_role_check 
  CHECK (role IN ('tank', 'cleric', 'bard', 'ranged_dps', 'melee_dps'));

-- Rename columns in parties table
ALTER TABLE parties RENAME COLUMN healers_needed TO clerics_needed;
ALTER TABLE parties RENAME COLUMN support_needed TO bards_needed;
ALTER TABLE parties RENAME COLUMN dps_needed TO ranged_dps_needed;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS melee_dps_needed INT DEFAULT 0;

-- Update any existing 'healer' roles to 'cleric'
UPDATE party_roster SET role = 'cleric' WHERE role = 'healer';
-- Update any existing 'support' roles to 'bard'
UPDATE party_roster SET role = 'bard' WHERE role = 'support';
-- Update any existing 'dps' roles to 'ranged_dps' (default choice)
UPDATE party_roster SET role = 'ranged_dps' WHERE role = 'dps';

-- =====================================================
-- EVENT ROLE UPDATES
-- =====================================================

-- Drop old constraint on event_rsvps if it exists
ALTER TABLE event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_role_check;

-- Update event_rsvps to use new roles
ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_role_check 
  CHECK (role IS NULL OR role IN ('tank', 'cleric', 'bard', 'ranged_dps', 'melee_dps'));

-- Rename columns in events table
ALTER TABLE events RENAME COLUMN healers_needed TO clerics_needed;
ALTER TABLE events RENAME COLUMN support_needed TO bards_needed;
ALTER TABLE events RENAME COLUMN dps_needed TO ranged_dps_needed;
ALTER TABLE events ADD COLUMN IF NOT EXISTS melee_dps_needed INT DEFAULT 0;

-- Update any existing 'healer' roles to 'cleric'
UPDATE event_rsvps SET role = 'cleric' WHERE role = 'healer';
-- Update any existing 'support' roles to 'bard'
UPDATE event_rsvps SET role = 'bard' WHERE role = 'support';
-- Update any existing 'dps' roles to 'ranged_dps' (default choice)
UPDATE event_rsvps SET role = 'ranged_dps' WHERE role = 'dps';

-- =====================================================
-- UPDATE COMMENTS
-- =====================================================

-- Party comments
COMMENT ON COLUMN parties.tanks_needed IS 'Number of tanks needed';
COMMENT ON COLUMN parties.clerics_needed IS 'Number of clerics needed';
COMMENT ON COLUMN parties.bards_needed IS 'Number of bards needed';
COMMENT ON COLUMN parties.ranged_dps_needed IS 'Number of ranged DPS needed';
COMMENT ON COLUMN parties.melee_dps_needed IS 'Number of melee DPS needed';
COMMENT ON COLUMN party_roster.role IS 'Role: tank, cleric, bard, ranged_dps, melee_dps';

-- Event comments
COMMENT ON COLUMN events.tanks_needed IS 'Number of tanks needed';
COMMENT ON COLUMN events.clerics_needed IS 'Number of clerics needed';
COMMENT ON COLUMN events.bards_needed IS 'Number of bards needed';
COMMENT ON COLUMN events.ranged_dps_needed IS 'Number of ranged DPS needed';
COMMENT ON COLUMN events.melee_dps_needed IS 'Number of melee DPS needed';
COMMENT ON COLUMN event_rsvps.role IS 'Role: tank, cleric, bard, ranged_dps, melee_dps';
