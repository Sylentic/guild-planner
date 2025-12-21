-- =====================================================
-- 012_caravans.sql - Caravan Coordination System
-- Plan and coordinate guild caravan runs
-- =====================================================

-- Caravan type enum
DO $$ BEGIN
  CREATE TYPE caravan_type AS ENUM (
    'personal',      -- Small personal caravan
    'guild',         -- Guild-organized caravan
    'trade_route',   -- Regular trade route run
    'escort'         -- Escort mission for another caravan
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Caravan status enum
DO $$ BEGIN
  CREATE TYPE caravan_status AS ENUM (
    'planning',      -- Being organized
    'recruiting',    -- Looking for escorts
    'ready',         -- Ready to depart
    'in_transit',    -- Currently running
    'completed',     -- Successfully completed
    'failed',        -- Attacked/destroyed
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Caravan events table
CREATE TABLE IF NOT EXISTS caravan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Organizer
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  -- Details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  caravan_type caravan_type NOT NULL DEFAULT 'guild',
  -- Route
  origin_node VARCHAR(100) NOT NULL,
  destination_node VARCHAR(100) NOT NULL,
  estimated_distance INTEGER, -- In game units/time
  -- Timing
  departure_at TIMESTAMPTZ NOT NULL,
  estimated_arrival_at TIMESTAMPTZ,
  -- Cargo
  cargo_description TEXT,
  cargo_value INTEGER DEFAULT 0, -- Estimated gold value
  -- Escort requirements
  min_escorts INTEGER DEFAULT 5,
  max_escorts INTEGER DEFAULT 20,
  -- Status
  status caravan_status DEFAULT 'planning',
  completed_at TIMESTAMPTZ,
  was_attacked BOOLEAN DEFAULT FALSE,
  -- Rewards
  escort_reward_gold INTEGER DEFAULT 0,
  escort_reward_dkp INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caravan escorts (signups)
CREATE TABLE IF NOT EXISTS caravan_escorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caravan_id UUID NOT NULL REFERENCES caravan_events(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  -- Role
  role VARCHAR(50) DEFAULT 'escort', -- escort, scout, lead
  -- Status
  confirmed BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE,
  -- Notes
  notes TEXT,
  -- Metadata
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  -- One signup per character
  UNIQUE(caravan_id, character_id)
);

-- Caravan route waypoints
CREATE TABLE IF NOT EXISTS caravan_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caravan_id UUID NOT NULL REFERENCES caravan_events(id) ON DELETE CASCADE,
  -- Waypoint details
  order_index INTEGER NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  notes TEXT,
  is_danger_zone BOOLEAN DEFAULT FALSE,
  estimated_time_minutes INTEGER,
  -- Actual tracking
  reached_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_caravan_events_clan ON caravan_events(clan_id);
CREATE INDEX IF NOT EXISTS idx_caravan_events_status ON caravan_events(status);
CREATE INDEX IF NOT EXISTS idx_caravan_events_departure ON caravan_events(departure_at);
CREATE INDEX IF NOT EXISTS idx_caravan_escorts_caravan ON caravan_escorts(caravan_id);
CREATE INDEX IF NOT EXISTS idx_caravan_escorts_character ON caravan_escorts(character_id);
CREATE INDEX IF NOT EXISTS idx_caravan_waypoints_caravan ON caravan_waypoints(caravan_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE caravan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE caravan_escorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE caravan_waypoints ENABLE ROW LEVEL SECURITY;

-- Caravan events: clan members can view
CREATE POLICY "Clan members can view caravans"
  ON caravan_events FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Members can create caravans
CREATE POLICY "Members can create caravans"
  ON caravan_events FOR INSERT
  WITH CHECK (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- Creators and officers can update
CREATE POLICY "Creators and officers can update caravans"
  ON caravan_events FOR UPDATE
  USING (
    created_by = auth.uid()
    OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- Creators and officers can delete
CREATE POLICY "Creators and officers can delete caravans"
  ON caravan_events FOR DELETE
  USING (
    created_by = auth.uid()
    OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- Escorts: clan members can view
CREATE POLICY "Clan members can view escorts"
  ON caravan_escorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caravan_events ce
      WHERE ce.id = caravan_escorts.caravan_id
      AND user_has_clan_role(ce.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Members can sign up their characters
CREATE POLICY "Members can sign up for escort"
  ON caravan_escorts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN caravan_events ce ON ce.clan_id = m.clan_id
      WHERE m.id = caravan_escorts.character_id
      AND ce.id = caravan_escorts.caravan_id
      AND m.user_id = auth.uid()
    )
  );

-- Members can update own signups
CREATE POLICY "Members can update own escort signup"
  ON caravan_escorts FOR UPDATE
  USING (user_id = auth.uid());

-- Members can withdraw
CREATE POLICY "Members can withdraw from escort"
  ON caravan_escorts FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM caravan_events ce
      WHERE ce.id = caravan_escorts.caravan_id
      AND user_has_clan_role(ce.clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Waypoints: clan members can view
CREATE POLICY "Clan members can view waypoints"
  ON caravan_waypoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caravan_events ce
      WHERE ce.id = caravan_waypoints.caravan_id
      AND user_has_clan_role(ce.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

-- Creators and officers can manage waypoints
CREATE POLICY "Creators can manage waypoints"
  ON caravan_waypoints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM caravan_events ce
      WHERE ce.id = caravan_waypoints.caravan_id
      AND (ce.created_by = auth.uid() OR user_has_clan_role(ce.clan_id, auth.uid(), ARRAY['admin', 'officer']))
    )
  );

-- Comments
COMMENT ON TABLE caravan_events IS 'Guild caravan coordination and planning';
COMMENT ON TABLE caravan_escorts IS 'Player signups for caravan escort duty';
COMMENT ON TABLE caravan_waypoints IS 'Route waypoints for caravan runs';
