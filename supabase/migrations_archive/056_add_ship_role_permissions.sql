-- Add role-based permissions for ship management
-- Allows restricting who can add/edit/delete ships based on their group role

-- Add a table to store which roles can manage ships for each game
CREATE TABLE IF NOT EXISTS game_ship_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  min_role TEXT NOT NULL DEFAULT 'member', -- Minimum role required to manage ships (admin, officer, member)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, game_slug)
);

-- Index for querying permissions by group and game
CREATE INDEX IF NOT EXISTS idx_game_ship_permissions_group_game 
  ON game_ship_permissions(group_id, game_slug);

-- RLS Policies
ALTER TABLE game_ship_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage ship permissions for their groups
CREATE POLICY "Admins can manage ship permissions in their groups"
  ON game_ship_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = game_ship_permissions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- All authenticated users can view ship permissions for their groups
CREATE POLICY "Users can view ship permissions in their groups"
  ON game_ship_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = game_ship_permissions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Initialize default permissions for Star Citizen (allow members to manage ships)
INSERT INTO game_ship_permissions (group_id, game_slug, min_role)
SELECT id, 'star-citizen', 'member'
FROM groups
WHERE id NOT IN (
  SELECT DISTINCT group_id FROM game_ship_permissions WHERE game_slug = 'star-citizen'
)
ON CONFLICT DO NOTHING;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_game_ship_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_ship_permissions_updated_at
  BEFORE UPDATE ON game_ship_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_game_ship_permissions_updated_at();

-- Update migration history
INSERT INTO migration_history (filename) VALUES ('056_add_ship_role_permissions.sql') ON CONFLICT DO NOTHING;
