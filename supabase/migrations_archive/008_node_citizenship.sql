-- =====================================================
-- 007_node_citizenship.sql - Node Citizenship Tracking
-- Track where guild members are citizens in the world
-- =====================================================

-- Node type enum (4 types in AoC)
DO $$ BEGIN
  CREATE TYPE node_type AS ENUM ('divine', 'economic', 'military', 'scientific');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Node citizenship table
CREATE TABLE IF NOT EXISTS node_citizenships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  -- Node information
  node_name VARCHAR(100) NOT NULL,
  node_type node_type NOT NULL,
  node_stage INTEGER NOT NULL DEFAULT 3 CHECK (node_stage >= 0 AND node_stage <= 6),
  -- Stage 0=Wilderness, 1=Expedition, 2=Encampment, 3=Village, 4=Town, 5=City, 6=Metropolis
  -- Citizenship requires Stage 3+ but we track lower for world state
  region VARCHAR(100), -- Optional: area/zone name
  -- Special roles
  is_mayor BOOLEAN DEFAULT FALSE,
  is_council_member BOOLEAN DEFAULT FALSE,
  -- Metadata
  became_citizen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One citizenship per character (AoC rule)
  UNIQUE(character_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_node_citizenships_character ON node_citizenships(character_id);
CREATE INDEX IF NOT EXISTS idx_node_citizenships_node_name ON node_citizenships(node_name);
CREATE INDEX IF NOT EXISTS idx_node_citizenships_node_type ON node_citizenships(node_type);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE node_citizenships ENABLE ROW LEVEL SECURITY;

-- Clan members can view citizenships of their clan's characters
CREATE POLICY "Clan members can view citizenships"
  ON node_citizenships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = node_citizenships.character_id
      AND user_has_clan_role(m.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Users can manage citizenship for their own characters
CREATE POLICY "Users can manage own character citizenship"
  ON node_citizenships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = node_citizenships.character_id
      AND m.user_id = auth.uid()
    )
  );

-- Officers can manage any citizenship in their clan
CREATE POLICY "Officers can manage clan citizenships"
  ON node_citizenships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = node_citizenships.character_id
      AND user_has_clan_role(m.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- =====================================================
-- HELPER VIEW: Node distribution stats
-- =====================================================

CREATE OR REPLACE VIEW node_distribution AS
SELECT 
  m.clan_id,
  nc.node_name,
  nc.node_type,
  nc.node_stage,
  COUNT(*) as citizen_count,
  COUNT(*) FILTER (WHERE nc.is_mayor) as has_mayor,
  ARRAY_AGG(m.name ORDER BY m.name) as citizen_names
FROM node_citizenships nc
JOIN members m ON m.id = nc.character_id
GROUP BY m.clan_id, nc.node_name, nc.node_type, nc.node_stage;

-- Comments
COMMENT ON TABLE node_citizenships IS 'Tracks which node each character is a citizen of';
COMMENT ON COLUMN node_citizenships.node_stage IS '0=Wilderness, 1=Expedition, 2=Encampment, 3=Village, 4=Town, 5=City, 6=Metropolis';
COMMENT ON VIEW node_distribution IS 'Aggregated view of citizen distribution per node per clan';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('008_node_citizenship.sql');
