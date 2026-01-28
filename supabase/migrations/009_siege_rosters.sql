-- =====================================================
-- 008_siege_rosters.sql - Castle/Node Siege Management
-- Large-scale PvP event organization (250v250)
-- =====================================================

-- Siege type enum
DO $$ BEGIN
  CREATE TYPE siege_type AS ENUM (
    'castle_attack',    -- Attacking enemy castle
    'castle_defense',   -- Defending our castle
    'node_attack',      -- Attacking enemy node
    'node_defense'      -- Defending our node
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Siege role enum (different from party roles)
DO $$ BEGIN
  CREATE TYPE siege_role AS ENUM (
    'frontline',        -- Melee fighters, tanks
    'ranged',           -- Archers, mages
    'healer',           -- Healers and support
    'siege_operator',   -- Trebuchets, battering rams
    'scout',            -- Reconnaissance
    'reserve'           -- Backup players
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Roster status
DO $$ BEGIN
  CREATE TYPE roster_status AS ENUM (
    'signed_up',        -- Player signed up
    'confirmed',        -- Player confirmed attendance
    'checked_in',       -- Player checked in on event day
    'no_show'           -- Player didn't show up
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Siege events table
CREATE TABLE IF NOT EXISTS siege_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Event details
  title VARCHAR(100) NOT NULL,
  description TEXT,
  siege_type siege_type NOT NULL,
  target_name VARCHAR(100) NOT NULL, -- Castle/Node name
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  declaration_ends_at TIMESTAMPTZ, -- When signup closes
  -- Capacity
  max_participants INTEGER DEFAULT 250,
  -- Role requirements
  frontline_needed INTEGER DEFAULT 80,
  ranged_needed INTEGER DEFAULT 60,
  healer_needed INTEGER DEFAULT 40,
  siege_operator_needed INTEGER DEFAULT 20,
  scout_needed INTEGER DEFAULT 10,
  reserve_needed INTEGER DEFAULT 40,
  -- Status
  is_cancelled BOOLEAN DEFAULT FALSE,
  result VARCHAR(20) CHECK (result IN ('victory', 'defeat', 'draw', NULL)),
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Siege roster (player signups)
CREATE TABLE IF NOT EXISTS siege_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siege_id UUID NOT NULL REFERENCES siege_events(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  -- Assignment
  role siege_role NOT NULL,
  is_leader BOOLEAN DEFAULT FALSE, -- Squad/group leader
  priority INTEGER DEFAULT 0, -- Higher = more likely to get slot
  -- Status tracking
  status roster_status DEFAULT 'signed_up',
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  -- Notes
  note TEXT,
  -- Unique per siege per character
  UNIQUE(siege_id, character_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_siege_events_clan ON siege_events(clan_id);
CREATE INDEX IF NOT EXISTS idx_siege_events_starts_at ON siege_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_siege_events_type ON siege_events(siege_type);
CREATE INDEX IF NOT EXISTS idx_siege_roster_siege ON siege_roster(siege_id);
CREATE INDEX IF NOT EXISTS idx_siege_roster_character ON siege_roster(character_id);
CREATE INDEX IF NOT EXISTS idx_siege_roster_role ON siege_roster(role);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE siege_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE siege_roster ENABLE ROW LEVEL SECURITY;

-- Siege events: clan members can view
CREATE POLICY "Clan members can view sieges"
  ON siege_events FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Officers can manage siege events
CREATE POLICY "Officers can manage sieges"
  ON siege_events FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Roster: clan members can view
CREATE POLICY "Clan members can view roster"
  ON siege_roster FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM siege_events se
      WHERE se.id = siege_roster.siege_id
      AND user_has_clan_role(se.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Members can sign up their own characters
CREATE POLICY "Members can sign up own characters"
  ON siege_roster FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN siege_events se ON se.clan_id = m.clan_id
      WHERE m.id = siege_roster.character_id
      AND se.id = siege_roster.siege_id
      AND m.user_id = auth.uid()
    )
  );

-- Members can update their own signups
CREATE POLICY "Members can update own signup"
  ON siege_roster FOR UPDATE
  USING (user_id = auth.uid());

-- Members can withdraw, officers can manage all
CREATE POLICY "Members can withdraw or officers manage"
  ON siege_roster FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM siege_events se
      WHERE se.id = siege_roster.siege_id
      AND user_has_clan_role(se.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- =====================================================
-- HELPER VIEW: Siege roster counts
-- =====================================================

CREATE OR REPLACE VIEW siege_roster_counts AS
SELECT 
  sr.siege_id,
  sr.role,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE sr.status = 'confirmed') as confirmed_count,
  COUNT(*) FILTER (WHERE sr.status = 'checked_in') as checked_in_count
FROM siege_roster sr
GROUP BY sr.siege_id, sr.role;

-- Comments
COMMENT ON TABLE siege_events IS 'Castle and node siege events (250v250 battles)';
COMMENT ON TABLE siege_roster IS 'Player signups for siege events';
COMMENT ON VIEW siege_roster_counts IS 'Aggregated roster counts by role per siege';
