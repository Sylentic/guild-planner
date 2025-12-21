-- =====================================================
-- 016_builds.sql - Character Build Planner
-- Share and save character builds with skills/augments
-- =====================================================

-- Build visibility enum
DO $$ BEGIN
  CREATE TYPE build_visibility AS ENUM (
    'private',      -- Only owner
    'guild',        -- Guild members
    'public'        -- Everyone
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Builds table
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Creator
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clan_id UUID REFERENCES clans(id) ON DELETE SET NULL, -- Optional guild association
  -- Build info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- Class info
  primary_archetype VARCHAR(50) NOT NULL,
  secondary_archetype VARCHAR(50),
  -- Build data (JSON for flexibility)
  skills JSONB DEFAULT '[]', -- Array of skill selections
  augments JSONB DEFAULT '[]', -- Array of augment selections
  equipment JSONB DEFAULT '{}', -- Recommended gear
  stats JSONB DEFAULT '{}', -- Target stats
  -- Tags
  tags TEXT[] DEFAULT '{}', -- e.g. ['pvp', 'tank', 'siege']
  role VARCHAR(50), -- tank, healer, dps, support
  -- Visibility
  visibility build_visibility DEFAULT 'private',
  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  copies_count INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build likes (for rating)
CREATE TABLE IF NOT EXISTS build_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One like per user per build
  UNIQUE(build_id, user_id)
);

-- Build comments
CREATE TABLE IF NOT EXISTS build_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Comment
  content TEXT NOT NULL,
  -- Threading
  parent_id UUID REFERENCES build_comments(id) ON DELETE CASCADE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill definitions (reference data - minimal for flexibility)
CREATE TABLE IF NOT EXISTS skill_definitions (
  id VARCHAR(50) PRIMARY KEY,
  archetype VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  skill_type VARCHAR(50), -- active, passive, ultimate
  icon VARCHAR(100),
  -- For UI ordering
  sort_order INTEGER DEFAULT 0
);

-- Augment definitions
CREATE TABLE IF NOT EXISTS augment_definitions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  archetype_source VARCHAR(50) NOT NULL, -- Which archetype provides this augment
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_builds_creator ON builds(created_by);
CREATE INDEX IF NOT EXISTS idx_builds_clan ON builds(clan_id);
CREATE INDEX IF NOT EXISTS idx_builds_visibility ON builds(visibility);
CREATE INDEX IF NOT EXISTS idx_builds_archetype ON builds(primary_archetype);
CREATE INDEX IF NOT EXISTS idx_builds_tags ON builds USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_builds_likes ON builds(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_build_likes_build ON build_likes(build_id);
CREATE INDEX IF NOT EXISTS idx_build_comments_build ON build_comments(build_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE augment_definitions ENABLE ROW LEVEL SECURITY;

-- Builds: based on visibility
CREATE POLICY "View builds based on visibility"
  ON builds FOR SELECT
  USING (
    visibility = 'public'
    OR created_by = auth.uid()
    OR (visibility = 'guild' AND clan_id IS NOT NULL AND user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']))
  );

-- Owners can manage their builds
CREATE POLICY "Owners can manage builds"
  ON builds FOR ALL
  USING (created_by = auth.uid());

-- Likes: users can like visible builds
CREATE POLICY "Users can like builds"
  ON build_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON build_likes FOR ALL
  USING (user_id = auth.uid());

-- Comments: visible based on build visibility
CREATE POLICY "Comments visible with build"
  ON build_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM builds b
      WHERE b.id = build_comments.build_id
      AND (
        b.visibility = 'public'
        OR b.created_by = auth.uid()
        OR (b.visibility = 'guild' AND b.clan_id IS NOT NULL AND user_has_clan_role(b.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']))
      )
    )
  );

CREATE POLICY "Users can manage own comments"
  ON build_comments FOR ALL
  USING (user_id = auth.uid());

-- Skill/augment definitions: everyone can view
CREATE POLICY "Everyone can view skills"
  ON skill_definitions FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view augments"
  ON augment_definitions FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE builds IS 'Character build configurations with skills and augments';
COMMENT ON TABLE build_likes IS 'User likes for build rating';
COMMENT ON TABLE build_comments IS 'Comments and discussions on builds';
COMMENT ON TABLE skill_definitions IS 'Reference data for class skills';
COMMENT ON TABLE augment_definitions IS 'Reference data for skill augments';
