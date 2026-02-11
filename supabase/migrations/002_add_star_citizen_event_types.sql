-- Migration: 002_add_star_citizen_event_types
-- Purpose: Add Star Citizen event types to the event_type enum
-- Date: 2026-02-11
-- Description: Adds missions, salvaging, pirating, and bounty_hunting event types for Star Citizen game support

-- Add new Star Citizen event types to the event_type ENUM
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'missions';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'salvaging';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'pirating';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'bounty_hunting';

-- Update comment to reflect all available event types
COMMENT ON TYPE event_type IS 'Event types: raid, siege, gathering, social, farming_glint, farming_materials, farming_gear, farming_other, missions, salvaging, pirating, bounty_hunting, other';

-- Record migration in history
INSERT INTO migration_history (filename) VALUES ('002_add_star_citizen_event_types.sql');
