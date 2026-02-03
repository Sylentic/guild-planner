-- =====================================================
-- Add RoR Event Role Requirements
-- =====================================================
-- Add role requirement columns for RoR events (2 Tank / 2 Healer / 2 DPS composition)

-- Add RoR-specific role requirement columns
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS ror_tanks_min INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ror_tanks_max INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ror_healers_min INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ror_healers_max INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ror_dps_min INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ror_dps_max INTEGER DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN events.ror_tanks_min IS 'Minimum number of tanks required for RoR events';
COMMENT ON COLUMN events.ror_tanks_max IS 'Maximum number of tanks allowed for RoR events (NULL = unlimited)';
COMMENT ON COLUMN events.ror_healers_min IS 'Minimum number of healers required for RoR events';
COMMENT ON COLUMN events.ror_healers_max IS 'Maximum number of healers allowed for RoR events (NULL = unlimited)';
COMMENT ON COLUMN events.ror_dps_min IS 'Minimum number of DPS required for RoR events (includes melee, skirmish, and ranged)';
COMMENT ON COLUMN events.ror_dps_max IS 'Maximum number of DPS allowed for RoR events (NULL = unlimited)';

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('061_ror_event_role_requirements.sql') ON CONFLICT DO NOTHING;
