-- =====================================================
-- Fix Quality Score Constraint
-- Removes the old 0-100 constraint and ensures unlimited quality values
-- =====================================================

-- Drop the existing constraint if it exists
ALTER TABLE member_professions 
  DROP CONSTRAINT IF EXISTS member_professions_quality_score_check;

-- Recreate with no upper limit
ALTER TABLE member_professions 
  ADD CONSTRAINT member_professions_quality_score_check 
    CHECK (quality_score >= 0);

-- Update comment to clarify
COMMENT ON COLUMN member_professions.quality_score IS 'Quality/proficiency score with all buffs (food, clothes, town buffs, etc.) - no upper limit, can be in thousands';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('024_fix_quality_constraint.sql');
