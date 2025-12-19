-- Clans table
CREATE TABLE clans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member professions (one row per profession per member)
CREATE TABLE member_professions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  profession VARCHAR(50) NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 4),
  UNIQUE(member_id, profession)
);

-- Create indexes for common queries
CREATE INDEX idx_members_clan_id ON members(clan_id);
CREATE INDEX idx_member_professions_member_id ON member_professions(member_id);
CREATE INDEX idx_clans_slug ON clans(slug);

-- Enable Row Level Security
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_professions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth required)
-- These can be modified later to add clan-based access control
CREATE POLICY "Allow all on clans" ON clans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on member_professions" ON member_professions FOR ALL USING (true) WITH CHECK (true);
