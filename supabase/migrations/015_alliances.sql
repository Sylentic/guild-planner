-- =====================================================
-- 013_alliances.sql - Alliance Management System
-- Cross-guild coordination and diplomacy
-- =====================================================

-- Alliance status enum
DO $$ BEGIN
  CREATE TYPE alliance_status AS ENUM (
    'pending',       -- Invitation sent
    'active',        -- Alliance is active
    'suspended',     -- Temporarily suspended
    'dissolved'      -- No longer allied
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alliances table
CREATE TABLE IF NOT EXISTS alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Name
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- Leadership
  leader_clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Settings
  is_public BOOLEAN DEFAULT FALSE, -- Public alliance page
  max_guilds INTEGER DEFAULT 10,
  -- Metadata
  formed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alliance membership
CREATE TABLE IF NOT EXISTS alliance_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Status
  status alliance_status DEFAULT 'pending',
  -- Role in alliance
  is_founder BOOLEAN DEFAULT FALSE,
  can_invite BOOLEAN DEFAULT FALSE,
  can_create_events BOOLEAN DEFAULT FALSE,
  -- When joined
  invited_by UUID REFERENCES clans(id),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One membership per clan per alliance
  UNIQUE(alliance_id, clan_id)
);

-- Shared alliance events
CREATE TABLE IF NOT EXISTS alliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  -- Event details (similar to regular events)
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- siege, raid, trade, social
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  -- Created by
  created_by_clan UUID REFERENCES clans(id) ON DELETE SET NULL,
  created_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Status
  is_cancelled BOOLEAN DEFAULT FALSE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alliance event participation (per guild)
CREATE TABLE IF NOT EXISTS alliance_event_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES alliance_events(id) ON DELETE CASCADE,
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  -- Commitment
  confirmed_count INTEGER DEFAULT 0,
  notes TEXT,
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, clan_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alliances_leader ON alliances(leader_clan_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_alliance ON alliance_members(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_clan ON alliance_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_status ON alliance_members(status);
CREATE INDEX IF NOT EXISTS idx_alliance_events_alliance ON alliance_events(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_events_starts ON alliance_events(starts_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_event_participation ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user's clan is in alliance
CREATE OR REPLACE FUNCTION user_in_alliance(p_alliance_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM alliance_members am
    JOIN clan_members cm ON cm.clan_id = am.clan_id
    WHERE am.alliance_id = p_alliance_id
    AND am.status = 'active'
    AND cm.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alliances: members can view
CREATE POLICY "Alliance members can view"
  ON alliances FOR SELECT
  USING (is_public OR user_in_alliance(id, auth.uid()));

-- Leader clan officers can manage
CREATE POLICY "Leader can manage alliance"
  ON alliances FOR ALL
  USING (user_has_clan_role(leader_clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Alliance members: alliance members can view
CREATE POLICY "Members can view alliance memberships"
  ON alliance_members FOR SELECT
  USING (user_in_alliance(alliance_id, auth.uid()));

-- Leader clan can manage memberships
CREATE POLICY "Leader can manage memberships"
  ON alliance_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alliances a
      WHERE a.id = alliance_members.alliance_id
      AND user_has_clan_role(a.leader_clan_id, auth.uid(), ARRAY['admin', 'officer'])
    )
  );

-- Events: alliance members can view
CREATE POLICY "Alliance members can view events"
  ON alliance_events FOR SELECT
  USING (user_in_alliance(alliance_id, auth.uid()));

-- Members with permission can create events
CREATE POLICY "Authorized members can manage events"
  ON alliance_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members am
      JOIN clan_members cm ON cm.clan_id = am.clan_id
      WHERE am.alliance_id = alliance_events.alliance_id
      AND am.can_create_events = TRUE
      AND cm.user_id = auth.uid()
    )
  );

-- Participation: alliance members can view
CREATE POLICY "Alliance members can view participation"
  ON alliance_event_participation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_events ae
      WHERE ae.id = alliance_event_participation.event_id
      AND user_in_alliance(ae.alliance_id, auth.uid())
    )
  );

-- Clan officers can update own participation
CREATE POLICY "Clan officers can update participation"
  ON alliance_event_participation FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Comments
COMMENT ON TABLE alliances IS 'Cross-guild alliances for coordination';
COMMENT ON TABLE alliance_members IS 'Guild memberships in alliances';
COMMENT ON TABLE alliance_events IS 'Shared events across allied guilds';
COMMENT ON TABLE alliance_event_participation IS 'Per-guild commitment to alliance events';
