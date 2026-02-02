-- Migration: Add combined DPS option to events
-- Purpose: Allow event creators to set a combined ranged+melee DPS max instead of separate limits

-- Add columns to track combined DPS settings
ALTER TABLE events
ADD COLUMN allow_combined_dps BOOLEAN DEFAULT FALSE,
ADD COLUMN combined_dps_max INTEGER;

-- Add constraint: if combined_dps is enabled, should have a max
-- (Note: This is advisory - can be null if not combined mode)

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('037_add_combined_dps_option.sql');
