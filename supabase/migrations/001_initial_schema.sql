-- =====================================================
-- AoC Guild Planner - Database Schema
-- Phase 1: Authentication & Security
-- =====================================================

-- Track applied migrations (must be first for all future DBs)
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Clans table
CREATE TABLE clans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID  -- Will reference users table after it's created
);

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id VARCHAR(50) UNIQUE,
  discord_username VARCHAR(100),
  discord_avatar VARCHAR(255),
  display_name VARCHAR(100),  -- Custom name, defaults to discord_username
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to clans.created_by after users table exists
ALTER TABLE clans ADD CONSTRAINT fk_clans_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Clan memberships with status and roles
CREATE TABLE clan_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (role IN ('admin', 'officer', 'member', 'pending')),
  is_creator BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  UNIQUE(clan_id, user_id)
);

-- Members table (game characters/players in clan)
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Optional: link to app user
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

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_members_clan_id ON members(clan_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_member_professions_member_id ON member_professions(member_id);
CREATE INDEX idx_clans_slug ON clans(slug);
CREATE INDEX idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX idx_clan_members_user_id ON clan_members(user_id);

-- =====================================================
-- HELPER FUNCTION
-- =====================================================

-- Function to check if user has an approved role in a clan (avoids recursion)
CREATE OR REPLACE FUNCTION user_has_clan_role(check_clan_id UUID, check_user_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clan_members 
    WHERE clan_id = check_clan_id 
    AND user_id = check_user_id 
    AND role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_professions ENABLE ROW LEVEL SECURITY;

-- USERS: Everyone can read, users can update own profile
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Auth can insert user on signup" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- CLANS: Public read for checking if clan exists, full access for members
-- We need public read so users can check if a clan exists before creating/joining
CREATE POLICY "Anyone can view clans" ON clans
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create clan" ON clans
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can update clan" ON clans
  FOR UPDATE USING (
    user_has_clan_role(id, auth.uid(), ARRAY['admin'])
  );

-- CLAN_MEMBERS: Simple policies to avoid recursion
-- Users can view their own memberships
CREATE POLICY "Users can view own membership" ON clan_members
  FOR SELECT USING (user_id = auth.uid());

-- Admins/Officers can view all members in their clans (uses SECURITY DEFINER function)
CREATE POLICY "Clan managers can view members" ON clan_members
  FOR SELECT USING (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
  );

-- Anyone can apply to join a clan (insert as pending with own user_id)
CREATE POLICY "Anyone can apply to clan" ON clan_members
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid() 
    AND role = 'pending'
  );

-- Special policy: Allow inserting as admin when creating clan (for the creator)
CREATE POLICY "Creator becomes admin" ON clan_members
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid() 
    AND role = 'admin'
    AND is_creator = TRUE
  );

-- Admin/Officer can update memberships (accept/reject)
CREATE POLICY "Admin/Officer manage memberships" ON clan_members
  FOR UPDATE USING (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- Admin can delete memberships, users can leave
CREATE POLICY "Admin can remove or user can leave" ON clan_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR user_has_clan_role(clan_id, auth.uid(), ARRAY['admin'])
  );

-- MEMBERS: Approved clan members can view
CREATE POLICY "Approved members can view members" ON members
  FOR SELECT USING (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
  );

CREATE POLICY "Admin/Officer manage members" ON members
  FOR INSERT WITH CHECK (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

CREATE POLICY "Admin/Officer update members" ON members
  FOR UPDATE USING (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

CREATE POLICY "Admin/Officer delete members" ON members
  FOR DELETE USING (
    user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer'])
  );

-- MEMBER_PROFESSIONS: Follow member access rules
CREATE POLICY "View professions if can view member" ON member_professions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE user_has_clan_role(clan_id, auth.uid(), ARRAY['admin', 'officer', 'member'])
    )
  );

CREATE POLICY "Modify professions" ON member_professions
  FOR ALL USING (
    member_id IN (
      SELECT m.id FROM members m
      WHERE user_has_clan_role(m.clan_id, auth.uid(), ARRAY['admin', 'officer'])
      OR (user_has_clan_role(m.clan_id, auth.uid(), ARRAY['member']) AND m.user_id = auth.uid())
    )
  );

-- =====================================================
-- HELPER FUNCTION: Create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, discord_id, discord_username, discord_avatar, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('001_initial_schema.sql');
