-- Migration 005: Parties, Recruitment & Public Profiles
-- Adds party system, recruitment, and public clan features

-- =====================================================
-- PARTY SYSTEM
-- =====================================================

-- Party templates table
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  -- Role requirements (how many of each role needed)
  tanks_needed INT DEFAULT 0,
  healers_needed INT DEFAULT 0,
  dps_needed INT DEFAULT 0,
  support_needed INT DEFAULT 0,
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Party roster (character assignments to parties)
CREATE TABLE party_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tank', 'healer', 'dps', 'support')),
  is_confirmed BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(party_id, character_id)
);

-- Indexes for parties
CREATE INDEX idx_parties_clan ON parties(clan_id);
CREATE INDEX idx_party_roster_party ON party_roster(party_id);
CREATE INDEX idx_party_roster_character ON party_roster(character_id);

-- RLS for parties
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_roster ENABLE ROW LEVEL SECURITY;

-- Anyone in clan can view parties
CREATE POLICY "Clan members can view parties"
  ON parties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = parties.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer', 'member')
    )
  );

-- Officers+ can manage parties
CREATE POLICY "Officers can manage parties"
  ON parties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = parties.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer')
    )
  );

-- Roster policies
CREATE POLICY "Clan members can view roster"
  ON party_roster FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parties p
      JOIN clan_members cm ON cm.clan_id = p.clan_id
      WHERE p.id = party_roster.party_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer', 'member')
    )
  );

CREATE POLICY "Officers can manage roster"
  ON party_roster FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM parties p
      JOIN clan_members cm ON cm.clan_id = p.clan_id
      WHERE p.id = party_roster.party_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer')
    )
  );

-- =====================================================
-- RECRUITMENT & PUBLIC PROFILES
-- =====================================================

-- Add public/recruitment fields to clans
ALTER TABLE clans ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE clans ADD COLUMN recruitment_open BOOLEAN DEFAULT false;
ALTER TABLE clans ADD COLUMN recruitment_message TEXT;
ALTER TABLE clans ADD COLUMN public_description TEXT;
ALTER TABLE clans ADD COLUMN banner_url TEXT;

-- Recruitment applications
CREATE TABLE recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  -- Application data
  discord_username TEXT NOT NULL,
  character_name TEXT,
  primary_class TEXT,
  experience TEXT,
  availability TEXT,
  message TEXT,
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT
);

-- Index for applications
CREATE INDEX idx_applications_clan ON recruitment_applications(clan_id);
CREATE INDEX idx_applications_status ON recruitment_applications(status);

-- RLS for applications
ALTER TABLE recruitment_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit applications
CREATE POLICY "Anyone can submit applications"
  ON recruitment_applications FOR INSERT
  WITH CHECK (true);

-- Officers+ can view/manage applications
CREATE POLICY "Officers can manage applications"
  ON recruitment_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = recruitment_applications.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer')
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Officers can update applications"
  ON recruitment_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clan_members cm
      WHERE cm.clan_id = recruitment_applications.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'officer')
    )
  );

-- Public clan view (for non-members)
CREATE POLICY "Public clans are viewable"
  ON clans FOR SELECT
  USING (is_public = true OR EXISTS (
    SELECT 1 FROM clan_members cm
    WHERE cm.clan_id = clans.id
    AND cm.user_id = auth.uid()
  ));

COMMENT ON TABLE parties IS 'Party/raid group templates';
COMMENT ON TABLE party_roster IS 'Character assignments to parties';
COMMENT ON TABLE recruitment_applications IS 'Applications from potential recruits';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('005_parties.sql');
