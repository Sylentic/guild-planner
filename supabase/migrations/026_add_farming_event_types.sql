-- Add new farming event types to the event_type ENUM
-- Migration: 024_add_farming_event_types
-- Purpose: Add farming_glint, farming_materials, farming_gear, farming_other to event_type enum

-- Add the new enum values
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'farming_glint';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'farming_materials';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'farming_gear';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'farming_other';

-- Add comment documenting the change
COMMENT ON TYPE event_type IS 'Event types: raid, siege, gathering, social, farming_glint, farming_materials, farming_gear, farming_other, other';
