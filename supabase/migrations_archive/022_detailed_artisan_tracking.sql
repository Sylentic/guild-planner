-- =====================================================
-- Add Detailed Artisan Skill Tracking
-- Adds level (0-50) and quality fields for precise profession tracking
-- =====================================================

-- Add artisan level (0-50)
-- Levels map to ranks:
--   0-9 = Novice (rank 1)
--  10-19 = Apprentice (rank 2)
--  20-29 = Journeyman (rank 3)
--  30-39 = Master (rank 4)
--  40-50 = Grandmaster (rank 5)
ALTER TABLE member_professions 
  ADD COLUMN IF NOT EXISTS artisan_level INTEGER DEFAULT 0;

-- Add quality/proficiency score (can be in the thousands)
ALTER TABLE member_professions 
  ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0;

-- Add constraints
DO $$ BEGIN
  ALTER TABLE member_professions ADD CONSTRAINT member_professions_artisan_level_check 
    CHECK (artisan_level >= 0 AND artisan_level <= 50);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE member_professions ADD CONSTRAINT member_professions_quality_score_check 
    CHECK (quality_score >= 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add comments
COMMENT ON COLUMN member_professions.artisan_level IS 'Artisan skill level (0-50). Level ranges: 0-9=Novice, 10-19=Apprentice, 20-29=Journeyman, 30-39=Master, 40-50=Grandmaster. Note: Promotion to next rank requires manual certification.';
COMMENT ON COLUMN member_professions.quality_score IS 'Quality/proficiency score (no upper limit)';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('022_detailed_artisan_tracking.sql');
