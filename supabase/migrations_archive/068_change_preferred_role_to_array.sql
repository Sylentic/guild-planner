-- Change preferred_role from TEXT to TEXT[] to support multiple role selection
-- This allows characters to have multiple preferred roles (e.g., pilot AND gunner)

-- First, convert existing TEXT values to single-element arrays
ALTER TABLE members ALTER COLUMN preferred_role TYPE TEXT[] USING 
  CASE 
    WHEN preferred_role IS NULL THEN NULL
    WHEN preferred_role = '' THEN NULL
    ELSE ARRAY[preferred_role]
  END;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('068_change_preferred_role_to_array.sql') ON CONFLICT DO NOTHING;
