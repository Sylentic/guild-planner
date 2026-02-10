-- Migration: Add optional maximum caps for each role
-- Defaults to NULL (unlimited) but allows setting a cap if needed

ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS tanks_max INTEGER DEFAULT NULL;

ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS clerics_max INTEGER DEFAULT NULL;

ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS bards_max INTEGER DEFAULT NULL;

ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS ranged_dps_max INTEGER DEFAULT NULL;

ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS melee_dps_max INTEGER DEFAULT NULL;

COMMENT ON COLUMN events.tanks_max IS 'Maximum number of tanks allowed (NULL = unlimited)';
COMMENT ON COLUMN events.clerics_max IS 'Maximum number of clerics allowed (NULL = unlimited)';
COMMENT ON COLUMN events.bards_max IS 'Maximum number of bards allowed (NULL = unlimited)';
COMMENT ON COLUMN events.ranged_dps_max IS 'Maximum number of ranged DPS allowed (NULL = unlimited)';
COMMENT ON COLUMN events.melee_dps_max IS 'Maximum number of melee DPS allowed (NULL = unlimited)';

INSERT INTO migration_history (filename) VALUES ('033_add_role_max_caps.sql');
