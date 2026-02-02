-- Create group_games table to store which games are enabled for each group
CREATE TABLE IF NOT EXISTS group_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, game_slug)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_games_group_id ON group_games(group_id);
CREATE INDEX IF NOT EXISTS idx_group_games_game_slug ON group_games(game_slug);

-- Enable RLS
ALTER TABLE group_games ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view games for groups they're in
CREATE POLICY "Users can view games for their groups"
  ON group_games FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups 
      WHERE id IN (
        SELECT group_id FROM group_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Admins can manage games for their groups
CREATE POLICY "Admins can manage group games"
  ON group_games FOR ALL
  USING (
    user_has_clan_role(group_id, auth.uid(), 'admin')
  )
  WITH CHECK (
    user_has_clan_role(group_id, auth.uid(), 'admin')
  );
