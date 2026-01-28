-- =====================================================
-- 014_activity.sql - Activity Tracker
-- Track member participation and identify inactive players
-- =====================================================

-- Activity types enum
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'login',             -- Logged into app
    'event_signup',      -- Signed up for event
    'event_attend',      -- Attended event
    'siege_participate', -- Participated in siege
    'caravan_escort',    -- Escorted caravan
    'bank_deposit',      -- Deposited to bank
    'loot_received',     -- Received loot
    'dkp_earned',        -- Earned DKP points
    'character_update',  -- Updated character info
    'profession_update'  -- Updated profession ranks
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  -- Activity details
  activity_type activity_type NOT NULL,
  description TEXT,
  -- Context
  related_event_id UUID,
  related_siege_id UUID REFERENCES siege_events(id) ON DELETE SET NULL,
  related_caravan_id UUID REFERENCES caravan_events(id) ON DELETE SET NULL,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member activity summary (materialized for performance)
CREATE TABLE IF NOT EXISTS member_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Activity counts (rolling 30 days)
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  events_attended_30d INTEGER DEFAULT 0,
  sieges_attended_30d INTEGER DEFAULT 0,
  caravans_escorted_30d INTEGER DEFAULT 0,
  bank_deposits_30d INTEGER DEFAULT 0,
  total_activities_30d INTEGER DEFAULT 0,
  -- Streak tracking
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  -- Inactivity flag
  is_inactive BOOLEAN DEFAULT FALSE,
  inactive_since TIMESTAMPTZ,
  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique per user per clan
  UNIQUE(clan_id, user_id)
);

-- Inactivity alerts
CREATE TABLE IF NOT EXISTS inactivity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Alert details
  days_inactive INTEGER NOT NULL,
  alert_level VARCHAR(20) DEFAULT 'warning', -- warning, critical
  -- Status
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_clan ON activity_log(clan_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_member_activity_clan ON member_activity_summary(clan_id);
CREATE INDEX IF NOT EXISTS idx_member_activity_inactive ON member_activity_summary(is_inactive);
CREATE INDEX IF NOT EXISTS idx_inactivity_alerts_clan ON inactivity_alerts(clan_id);
CREATE INDEX IF NOT EXISTS idx_inactivity_alerts_ack ON inactivity_alerts(is_acknowledged);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE inactivity_alerts ENABLE ROW LEVEL SECURITY;

-- Activity log: officers can view
CREATE POLICY "Officers can view activity log"
  ON activity_log FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- System can insert (or members for their own)
CREATE POLICY "Can log own activity"
  ON activity_log FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- Activity summary: officers can view
CREATE POLICY "Officers can view activity summary"
  ON member_activity_summary FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Members can view own summary
CREATE POLICY "Members can view own summary"
  ON member_activity_summary FOR SELECT
  USING (user_id = auth.uid());

-- System manages summaries
CREATE POLICY "System manages summaries"
  ON member_activity_summary FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Inactivity alerts: officers
CREATE POLICY "Officers can view alerts"
  ON inactivity_alerts FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers can manage alerts"
  ON inactivity_alerts FOR ALL
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Comments
COMMENT ON TABLE activity_log IS 'Raw activity tracking for members';
COMMENT ON TABLE member_activity_summary IS 'Aggregated activity metrics per member';
COMMENT ON TABLE inactivity_alerts IS 'Alerts for inactive guild members';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('016_activity.sql');
