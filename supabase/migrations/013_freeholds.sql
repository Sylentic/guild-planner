-- =====================================================
-- 011_freeholds.sql - Freehold Registry
-- Track guild member freeholds and their buildings
-- =====================================================

-- Freehold building type enum
DO $$ BEGIN
  CREATE TYPE freehold_building_type AS ENUM (
    -- Processing buildings
    'smelter',
    'lumbermill',
    'tannery',
    'loom',
    'farm',
    'stable',
    -- Crafting buildings
    'forge',
    'workshop',
    'clothier',
    'jeweler',
    'alchemist_lab',
    'kitchen',
    -- Other
    'warehouse',
    'tavern',
    'inn',
    'house'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Freehold size enum
DO $$ BEGIN
  CREATE TYPE freehold_size AS ENUM (
    'small',   -- 8x8
    'medium',  -- 16x16
    'large'    -- 32x32
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Freeholds table
CREATE TABLE IF NOT EXISTS freeholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Owner
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  -- Location
  name VARCHAR(100) NOT NULL,
  node_name VARCHAR(100), -- Parent node
  region VARCHAR(100),
  coordinates VARCHAR(50), -- e.g. "1234, 5678"
  -- Details
  size freehold_size NOT NULL DEFAULT 'medium',
  is_public BOOLEAN DEFAULT FALSE, -- Allow guild to use
  description TEXT,
  -- Metadata
  established_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freehold buildings
CREATE TABLE IF NOT EXISTS freehold_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freehold_id UUID NOT NULL REFERENCES freeholds(id) ON DELETE CASCADE,
  -- Building info
  building_type freehold_building_type NOT NULL,
  building_name VARCHAR(100),
  tier INTEGER DEFAULT 1 CHECK (tier >= 1 AND tier <= 3),
  -- Associated profession
  profession_id VARCHAR(50), -- Links to profession system
  -- Access
  is_guild_accessible BOOLEAN DEFAULT FALSE,
  usage_fee INTEGER DEFAULT 0, -- Gold cost for guild to use
  -- Metadata
  built_at TIMESTAMPTZ DEFAULT NOW(),
  upgraded_at TIMESTAMPTZ
);

-- Freehold access schedule (when buildings are available)
CREATE TABLE IF NOT EXISTS freehold_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freehold_id UUID NOT NULL REFERENCES freeholds(id) ON DELETE CASCADE,
  building_id UUID REFERENCES freehold_buildings(id) ON DELETE CASCADE,
  -- Schedule
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME,
  end_time TIME,
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freeholds_clan ON freeholds(clan_id);
CREATE INDEX IF NOT EXISTS idx_freeholds_owner ON freeholds(owner_id);
CREATE INDEX IF NOT EXISTS idx_freeholds_node ON freeholds(node_name);
CREATE INDEX IF NOT EXISTS idx_freehold_buildings_freehold ON freehold_buildings(freehold_id);
CREATE INDEX IF NOT EXISTS idx_freehold_buildings_type ON freehold_buildings(building_type);
CREATE INDEX IF NOT EXISTS idx_freehold_schedules_freehold ON freehold_schedules(freehold_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE freeholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE freehold_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE freehold_schedules ENABLE ROW LEVEL SECURITY;

-- Freeholds: clan members can view
CREATE POLICY "Clan members can view freeholds"
  ON freeholds FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Owners can manage their freeholds
CREATE POLICY "Owners can manage own freeholds"
  ON freeholds FOR ALL
  USING (owner_id = auth.uid());

-- Officers can manage all freeholds
CREATE POLICY "Officers can manage all freeholds"
  ON freeholds FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Buildings: same as freeholds
CREATE POLICY "Clan members can view buildings"
  ON freehold_buildings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freeholds f
      WHERE f.id = freehold_buildings.freehold_id
      AND user_has_clan_role(f.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

CREATE POLICY "Freehold owners can manage buildings"
  ON freehold_buildings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM freeholds f
      WHERE f.id = freehold_buildings.freehold_id
      AND f.owner_id = auth.uid()
    )
  );

-- Schedules: same pattern
CREATE POLICY "Clan members can view schedules"
  ON freehold_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM freeholds f
      WHERE f.id = freehold_schedules.freehold_id
      AND user_has_clan_role(f.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

CREATE POLICY "Freehold owners can manage schedules"
  ON freehold_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM freeholds f
      WHERE f.id = freehold_schedules.freehold_id
      AND f.owner_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE freeholds IS 'Guild member freeholds registry';
COMMENT ON TABLE freehold_buildings IS 'Buildings on member freeholds';
COMMENT ON TABLE freehold_schedules IS 'When freehold buildings are available for guild use';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('013_freeholds.sql');
