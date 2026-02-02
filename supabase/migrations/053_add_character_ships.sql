-- Add ship ownership tracking for Star Citizen characters
-- A character can own multiple ships with different ownership types

CREATE TABLE IF NOT EXISTS character_ships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  ship_id TEXT NOT NULL, -- References ship ID from star-citizen-ships.json
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('owned-pledge', 'owned-auec', 'concept-pledge', 'loaner')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, ship_id, ownership_type)
);

-- Index for querying ships by character
CREATE INDEX IF NOT EXISTS idx_character_ships_character_id ON character_ships(character_id);

-- Index for querying by ownership type
CREATE INDEX IF NOT EXISTS idx_character_ships_ownership_type ON character_ships(ownership_type);

-- RLS Policies
ALTER TABLE character_ships ENABLE ROW LEVEL SECURITY;

-- Users can view ships for characters in their groups
CREATE POLICY "Users can view character ships in their groups"
  ON character_ships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN group_members gm ON gm.user_id = m.user_id
      WHERE m.id = character_ships.character_id
      AND gm.group_id = m.group_id
    )
  );

-- Users can manage ships for their own characters
CREATE POLICY "Users can manage their own character ships"
  ON character_ships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = character_ships.character_id
      AND m.user_id = auth.uid()
    )
  );

-- Admins and officers can manage all character ships in their groups
CREATE POLICY "Admins and officers can manage character ships in their groups"
  ON character_ships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN group_members gm ON gm.user_id = auth.uid()
      WHERE m.id = character_ships.character_id
      AND gm.group_id = m.group_id
      AND gm.role IN ('admin', 'officer')
    )
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_character_ships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_character_ships_updated_at
  BEFORE UPDATE ON character_ships
  FOR EACH ROW
  EXECUTE FUNCTION update_character_ships_updated_at();

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('053_add_character_ships.sql') ON CONFLICT DO NOTHING;
