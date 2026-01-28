-- =====================================================
-- 015_achievements.sql - Guild Achievements System
-- Track and celebrate guild milestones
-- =====================================================

-- Achievement category enum
DO $$ BEGIN
  CREATE TYPE achievement_category AS ENUM (
    'guild',           -- Guild-wide achievements
    'pvp',             -- Combat/siege achievements  
    'economy',         -- Trade/crafting achievements
    'community',       -- Social achievements
    'milestone'        -- Numeric milestones
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Achievement definitions (templates)
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Details
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  icon VARCHAR(50), -- Emoji or icon name
  -- Requirements
  requirement_type VARCHAR(50) NOT NULL, -- e.g. 'member_count', 'siege_wins', 'gold_deposited'
  requirement_value INTEGER NOT NULL,
  -- Display
  is_hidden BOOLEAN DEFAULT FALSE, -- Hidden until unlocked
  points INTEGER DEFAULT 10, -- Achievement points
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  -- Global definitions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clan achievements (unlocked)
CREATE TABLE IF NOT EXISTS clan_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  -- Progress
  current_value INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  -- First to unlock in clan
  first_contributor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One per clan per achievement
  UNIQUE(clan_id, achievement_id)
);

-- Achievement notifications (to send to Discord etc)
CREATE TABLE IF NOT EXISTS achievement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  -- Notification status
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category ON achievement_definitions(category);
CREATE INDEX IF NOT EXISTS idx_clan_achievements_clan ON clan_achievements(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_achievements_unlocked ON clan_achievements(is_unlocked);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_clan ON achievement_notifications(clan_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_sent ON achievement_notifications(is_sent);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;

-- Definitions: everyone can view
CREATE POLICY "Everyone can view achievement definitions"
  ON achievement_definitions FOR SELECT
  USING (true);

-- Clan achievements: clan members can view
CREATE POLICY "Clan members can view achievements"
  ON clan_achievements FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

-- System manages achievements
CREATE POLICY "System manages achievements"
  ON clan_achievements FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Notifications: officers
CREATE POLICY "Officers can view notifications"
  ON achievement_notifications FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers can manage notifications"
  ON achievement_notifications FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- =====================================================
-- SEED: Default Achievements
-- =====================================================

INSERT INTO achievement_definitions (name, description, category, icon, requirement_type, requirement_value, points, sort_order) VALUES
  -- Guild milestones
  ('First Steps', 'Guild created with first member', 'milestone', '🌱', 'member_count', 1, 5, 1),
  ('Growing Strong', 'Reach 10 guild members', 'milestone', '🌿', 'member_count', 10, 10, 2),
  ('Full House', 'Reach 50 guild members', 'milestone', '🌳', 'member_count', 50, 25, 3),
  ('Army', 'Reach 100 guild members', 'milestone', '⚔️', 'member_count', 100, 50, 4),
  -- PvP
  ('First Blood', 'Win your first siege', 'pvp', '🗡️', 'siege_wins', 1, 15, 10),
  ('Siege Veterans', 'Win 10 sieges', 'pvp', '🏰', 'siege_wins', 10, 50, 11),
  ('Conquerors', 'Win 50 sieges', 'pvp', '👑', 'siege_wins', 50, 100, 12),
  -- Economy
  ('Bank Opened', 'Make first guild bank deposit', 'economy', '💰', 'bank_deposits', 1, 10, 20),
  ('Trading Empire', 'Complete 10 caravan runs', 'economy', '🚚', 'caravan_complete', 10, 30, 21),
  ('Master Crafters', 'Have 5 Grandmaster crafters', 'economy', '⚒️', 'grandmaster_count', 5, 50, 22),
  -- Community
  ('Event Planners', 'Host 10 guild events', 'community', '📅', 'events_hosted', 10, 20, 30),
  ('Active Roster', 'Have 25 active members in a week', 'community', '✨', 'weekly_active', 25, 40, 31)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE achievement_definitions IS 'Achievement templates and requirements';
COMMENT ON TABLE clan_achievements IS 'Clan progress and unlocks for achievements';
COMMENT ON TABLE achievement_notifications IS 'Queue for achievement unlock notifications';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('017_achievements.sql');
