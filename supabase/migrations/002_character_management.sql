-- =====================================================
-- Phase 2 Migration: Character Management
-- Run this AFTER the initial schema.sql
-- =====================================================

-- Add race enum type
DO $$ BEGIN
  CREATE TYPE race AS ENUM (
    'kaelar', 'vaelune',           -- Aela Humans
    'dunir', 'nikua',              -- Dünzenkell Dwarves  
    'empyrean', 'pyrai',           -- Pyrian Elves
    'renkai', 'vek',               -- Kaivek Orcs
    'tulnar'                       -- Tulnar
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add archetype enum type
DO $$ BEGIN
  CREATE TYPE archetype AS ENUM (
    'tank', 'cleric', 'mage', 'fighter', 
    'ranger', 'bard', 'rogue', 'summoner'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to members table
ALTER TABLE members 
  ADD COLUMN IF NOT EXISTS race race,
  ADD COLUMN IF NOT EXISTS primary_archetype archetype,
  ADD COLUMN IF NOT EXISTS secondary_archetype archetype,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT FALSE;

-- Add level constraint
DO $$ BEGIN
  ALTER TABLE members ADD CONSTRAINT members_level_check 
    CHECK (level >= 1 AND level <= 50);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create index for main characters
CREATE INDEX IF NOT EXISTS idx_members_is_main ON members(user_id, is_main) WHERE is_main = TRUE;

-- Comment for documentation
COMMENT ON COLUMN members.race IS 'Character race (kaelar, vaelune, dunir, etc.)';
COMMENT ON COLUMN members.primary_archetype IS 'Primary archetype chosen at character creation';
COMMENT ON COLUMN members.secondary_archetype IS 'Secondary archetype chosen at level 25';
COMMENT ON COLUMN members.level IS 'Character level (1-50)';
COMMENT ON COLUMN members.is_main IS 'Whether this is the users main character';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('002_character_management.sql');
