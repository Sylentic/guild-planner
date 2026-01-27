-- =====================================================
-- Enforce Single Main Character Per User
-- Ensures only one character per user can be marked as main
-- =====================================================

-- Drop the old index
DROP INDEX IF EXISTS idx_members_is_main;

-- Create a unique partial index to enforce only one main character per user
-- This allows NULL user_id (guest characters) to have multiple mains
CREATE UNIQUE INDEX idx_members_one_main_per_user 
  ON members(user_id) 
  WHERE is_main = TRUE AND user_id IS NOT NULL;

-- Update comment for clarity
COMMENT ON COLUMN members.is_main IS 'Whether this is the users main character. Only one main per user_id is allowed.';
