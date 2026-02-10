-- =====================================================
-- 003_events.sql - Events, RSVPs, Announcements
-- =====================================================

-- Event types
DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('raid', 'siege', 'gathering', 'social', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rsvp_status AS ENUM ('attending', 'maybe', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add timezone to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  event_type event_type DEFAULT 'other',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location VARCHAR(100),
  max_attendees INTEGER,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES members(id) ON DELETE SET NULL,
  status rsvp_status DEFAULT 'attending',
  note TEXT,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Clan announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_clan_id ON events(clan_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_clan_id ON announcements(clan_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(clan_id, is_pinned) WHERE is_pinned = TRUE;

-- RLS Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members can view events"
  ON events FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial']));

CREATE POLICY "Officers+ can create events"
  ON events FOR INSERT
  WITH CHECK (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers+ can update events"
  ON events FOR UPDATE
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers+ can delete events"
  ON events FOR DELETE
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- RLS Policies for RSVPs
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members can view RSVPs"
  ON event_rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

CREATE POLICY "Members can RSVP"
  ON event_rsvps FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id 
      AND user_has_clan_role(e.clan_id, auth.uid(), ARRAY['admin', 'officer', 'member', 'trial'])
    )
  );

CREATE POLICY "Users can update own RSVP"
  ON event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP"
  ON event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan members can view announcements"
  ON announcements FOR SELECT
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member']));

CREATE POLICY "Officers+ can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers+ can update announcements"
  ON announcements FOR UPDATE
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

CREATE POLICY "Officers+ can delete announcements"
  ON announcements FOR DELETE
  USING (user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer']));

-- Comments
COMMENT ON TABLE events IS 'Clan events like raids, sieges, gatherings';
COMMENT ON TABLE event_rsvps IS 'Member responses to events';
COMMENT ON TABLE announcements IS 'Clan announcements and pinned messages';
COMMENT ON COLUMN users.timezone IS 'User timezone for displaying event times (IANA format)';

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('003_events.sql');
