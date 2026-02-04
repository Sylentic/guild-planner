-- Migration 058: Add ship management permissions
-- Purpose: Add permissions for managing ships (Star Citizen)
-- Allows role-based control over who can add/edit/delete ships

-- Add ship permission columns to group_permission_overrides table
ALTER TABLE group_permission_overrides
  ADD COLUMN IF NOT EXISTS ships_create BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ships_edit_own BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ships_edit_any BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ships_delete_own BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ships_delete_any BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN group_permission_overrides.ships_create IS 'Permission to add ships to characters';
COMMENT ON COLUMN group_permission_overrides.ships_edit_own IS 'Permission to edit ships on own characters';
COMMENT ON COLUMN group_permission_overrides.ships_edit_any IS 'Permission to edit ships on any character';
COMMENT ON COLUMN group_permission_overrides.ships_delete_own IS 'Permission to delete ships from own characters';
COMMENT ON COLUMN group_permission_overrides.ships_delete_any IS 'Permission to delete ships from any character';

-- Update existing rows with default values based on role
UPDATE group_permission_overrides
SET 
  ships_create = CASE 
    WHEN role = 'admin' THEN TRUE
    WHEN role = 'officer' THEN TRUE
    WHEN role = 'member' THEN TRUE
    WHEN role = 'trial' THEN TRUE
    ELSE FALSE
  END,
  ships_edit_own = CASE 
    WHEN role = 'admin' THEN TRUE
    WHEN role = 'officer' THEN TRUE
    WHEN role = 'member' THEN TRUE
    WHEN role = 'trial' THEN TRUE
    ELSE FALSE
  END,
  ships_edit_any = CASE 
    WHEN role = 'admin' THEN TRUE
    WHEN role = 'officer' THEN TRUE
    ELSE FALSE
  END,
  ships_delete_own = CASE 
    WHEN role = 'admin' THEN TRUE
    WHEN role = 'officer' THEN TRUE
    WHEN role = 'member' THEN TRUE
    WHEN role = 'trial' THEN TRUE
    ELSE FALSE
  END,
  ships_delete_any = CASE 
    WHEN role = 'admin' THEN TRUE
    WHEN role = 'officer' THEN TRUE
    ELSE FALSE
  END
WHERE ships_create IS NULL;

-- Update migration history
INSERT INTO migration_history (filename) VALUES ('058_add_ship_permissions.sql') ON CONFLICT DO NOTHING;
