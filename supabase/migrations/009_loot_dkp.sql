-- =====================================================
-- 009_loot_dkp.sql - Loot Distribution & DKP System
-- Fair loot distribution with multiple system support
-- =====================================================

-- Loot system type enum
DO $$ BEGIN
  CREATE TYPE loot_system_type AS ENUM (
    'dkp',           -- Dragon Kill Points
    'epgp',          -- Effort Points / Gear Points
    'loot_council',  -- Officer voting
    'roll',          -- Random /roll
    'round_robin'    -- Taking turns
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Item rarity enum
DO $$ BEGIN
  CREATE TYPE item_rarity AS ENUM (
    'common',
    'uncommon', 
    'rare',
    'heroic',
    'epic',
    'legendary'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Loot system configuration per clan
CREATE TABLE IF NOT EXISTS loot_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- System configuration
  system_type loot_system_type DEFAULT 'dkp',
  name VARCHAR(100) NOT NULL DEFAULT 'Default',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  -- DKP specific settings
  starting_points INTEGER DEFAULT 0,
  decay_enabled BOOLEAN DEFAULT FALSE,
  decay_rate DECIMAL(5,2) DEFAULT 0, -- Percentage per week
  decay_minimum INTEGER DEFAULT 0, -- Minimum points after decay
  -- Points for activities
  raid_attendance_points INTEGER DEFAULT 10,
  siege_attendance_points INTEGER DEFAULT 15,
  boss_kill_points INTEGER DEFAULT 5,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One active system per clan
  UNIQUE(clan_id, is_active) WHERE is_active = TRUE
);

-- Character DKP points
CREATE TABLE IF NOT EXISTS dkp_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loot_system_id UUID NOT NULL REFERENCES loot_systems(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  -- Point totals
  current_points INTEGER DEFAULT 0,
  earned_total INTEGER DEFAULT 0,
  spent_total INTEGER DEFAULT 0,
  -- Priority tracking (for EPGP or priority systems)
  priority_ratio DECIMAL(5,2) DEFAULT 1.0,
  -- Metadata
  last_earned_at TIMESTAMPTZ,
  last_spent_at TIMESTAMPTZ,
  last_decay_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One entry per character per system
  UNIQUE(loot_system_id, character_id)
);

-- Loot history (all drops)
CREATE TABLE IF NOT EXISTS loot_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loot_system_id UUID NOT NULL REFERENCES loot_systems(id) ON DELETE CASCADE,
  -- Item info
  item_name VARCHAR(200) NOT NULL,
  item_rarity item_rarity DEFAULT 'rare',
  item_slot VARCHAR(50), -- e.g. 'weapon', 'helmet', 'ring'
  item_description TEXT,
  -- Source
  source_type VARCHAR(50), -- 'raid', 'siege', 'dungeon', 'world_boss'
  source_name VARCHAR(100), -- Boss or event name
  event_id UUID, -- Optional link to events table
  siege_id UUID REFERENCES siege_events(id) ON DELETE SET NULL,
  -- Distribution
  awarded_to UUID REFERENCES members(id) ON DELETE SET NULL,
  awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  -- DKP cost (if applicable)
  dkp_cost INTEGER DEFAULT 0,
  -- Voting (for loot council)
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  -- Metadata
  dropped_at TIMESTAMPTZ DEFAULT NOW(),
  distributed_at TIMESTAMPTZ,
  notes TEXT
);

-- DKP point transactions (for auditing)
CREATE TABLE IF NOT EXISTS dkp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dkp_points_id UUID NOT NULL REFERENCES dkp_points(id) ON DELETE CASCADE,
  -- Transaction details
  amount INTEGER NOT NULL, -- Positive = earned, negative = spent
  reason VARCHAR(200) NOT NULL,
  -- Links
  loot_id UUID REFERENCES loot_history(id) ON DELETE SET NULL,
  event_id UUID,
  siege_id UUID REFERENCES siege_events(id) ON DELETE SET NULL,
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loot_systems_clan ON loot_systems(clan_id);
CREATE INDEX IF NOT EXISTS idx_dkp_points_system ON dkp_points(loot_system_id);
CREATE INDEX IF NOT EXISTS idx_dkp_points_character ON dkp_points(character_id);
CREATE INDEX IF NOT EXISTS idx_loot_history_system ON loot_history(loot_system_id);
CREATE INDEX IF NOT EXISTS idx_loot_history_awarded ON loot_history(awarded_to);
CREATE INDEX IF NOT EXISTS idx_loot_history_dropped ON loot_history(dropped_at);
CREATE INDEX IF NOT EXISTS idx_dkp_transactions_points ON dkp_transactions(dkp_points_id);
CREATE INDEX IF NOT EXISTS idx_dkp_transactions_created ON dkp_transactions(created_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE loot_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE dkp_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dkp_transactions ENABLE ROW LEVEL SECURITY;

-- Loot systems: clan members can view
CREATE POLICY "Clan members can view loot systems"
  ON loot_systems FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Only officers can manage loot systems
CREATE POLICY "Officers can manage loot systems"
  ON loot_systems FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- DKP points: visible to clan members
CREATE POLICY "Clan members can view DKP"
  ON dkp_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loot_systems ls
      WHERE ls.id = dkp_points.loot_system_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Officers can manage DKP
CREATE POLICY "Officers can manage DKP"
  ON dkp_points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loot_systems ls
      WHERE ls.id = dkp_points.loot_system_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Loot history: visible to clan members
CREATE POLICY "Clan members can view loot history"
  ON loot_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loot_systems ls
      WHERE ls.id = loot_history.loot_system_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Officers can manage loot history
CREATE POLICY "Officers can manage loot history"
  ON loot_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM loot_systems ls
      WHERE ls.id = loot_history.loot_system_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Transactions: same as loot history
CREATE POLICY "Clan members can view transactions"
  ON dkp_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dkp_points dp
      JOIN loot_systems ls ON ls.id = dp.loot_system_id
      WHERE dp.id = dkp_transactions.dkp_points_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

CREATE POLICY "Officers can manage transactions"
  ON dkp_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dkp_points dp
      JOIN loot_systems ls ON ls.id = dp.loot_system_id
      WHERE dp.id = dkp_transactions.dkp_points_id
      AND user_has_clan_role(ls.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- =====================================================
-- HELPER VIEW: DKP Leaderboard
-- =====================================================

CREATE OR REPLACE VIEW dkp_leaderboard AS
SELECT 
  dp.loot_system_id,
  dp.character_id,
  m.name as character_name,
  m.clan_id,
  dp.current_points,
  dp.earned_total,
  dp.spent_total,
  dp.priority_ratio,
  dp.last_earned_at,
  RANK() OVER (PARTITION BY dp.loot_system_id ORDER BY dp.current_points DESC) as rank
FROM dkp_points dp
JOIN members m ON m.id = dp.character_id;

-- Comments
COMMENT ON TABLE loot_systems IS 'Clan loot distribution system configuration';
COMMENT ON TABLE dkp_points IS 'Character DKP point balances';
COMMENT ON TABLE loot_history IS 'Historical record of all loot drops and distribution';
COMMENT ON TABLE dkp_transactions IS 'Audit log of all DKP point changes';
COMMENT ON VIEW dkp_leaderboard IS 'Ranked DKP standings per loot system';
