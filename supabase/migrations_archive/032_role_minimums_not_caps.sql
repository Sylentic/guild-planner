-- Migration: Change role requirements from caps to minimums
-- Change field names to reflect they are minimums, not caps
-- This allows unlimited signups while still tracking minimum requirements

ALTER TABLE events 
  RENAME COLUMN tanks_needed TO tanks_min;

ALTER TABLE events 
  RENAME COLUMN clerics_needed TO clerics_min;

ALTER TABLE events 
  RENAME COLUMN bards_needed TO bards_min;

ALTER TABLE events 
  RENAME COLUMN ranged_dps_needed TO ranged_dps_min;

ALTER TABLE events 
  RENAME COLUMN melee_dps_needed TO melee_dps_min;

COMMENT ON COLUMN events.tanks_min IS 'Minimum number of tanks required (not a cap)';
COMMENT ON COLUMN events.clerics_min IS 'Minimum number of clerics required (not a cap)';
COMMENT ON COLUMN events.bards_min IS 'Minimum number of bards required (not a cap)';
COMMENT ON COLUMN events.ranged_dps_min IS 'Minimum number of ranged DPS required (not a cap)';
COMMENT ON COLUMN events.melee_dps_min IS 'Minimum number of melee DPS required (not a cap)';

INSERT INTO migration_history (filename) VALUES ('032_role_minimums_not_caps.sql');
