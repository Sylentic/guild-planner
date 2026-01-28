-- Migration 027: Add clan permission overrides table
-- Purpose: Store custom role-based permission overrides for clans
-- Allows admins to customize which permissions each role has

BEGIN;

-- Create table for storing custom role permission overrides
CREATE TABLE clan_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'member', 'trial', 'pending')),
  
  -- Character management permissions
  characters_create BOOLEAN DEFAULT TRUE,
  characters_read_all BOOLEAN DEFAULT TRUE,
  characters_edit_own BOOLEAN DEFAULT TRUE,
  characters_edit_any BOOLEAN DEFAULT FALSE,
  characters_delete_own BOOLEAN DEFAULT TRUE,
  characters_delete_any BOOLEAN DEFAULT FALSE,
  
  -- Guild bank permissions
  guild_bank_withdraw BOOLEAN DEFAULT FALSE,
  guild_bank_deposit BOOLEAN DEFAULT TRUE,
  guild_bank_view_history BOOLEAN DEFAULT FALSE,
  
  -- Event permissions
  events_create BOOLEAN DEFAULT FALSE,
  events_read BOOLEAN DEFAULT TRUE,
  events_edit_own BOOLEAN DEFAULT FALSE,
  events_edit_any BOOLEAN DEFAULT FALSE,
  events_delete_own BOOLEAN DEFAULT FALSE,
  events_delete_any BOOLEAN DEFAULT FALSE,
  events_rsvp BOOLEAN DEFAULT TRUE,
  
  -- Party permissions
  parties_create BOOLEAN DEFAULT FALSE,
  parties_read BOOLEAN DEFAULT TRUE,
  parties_edit_own BOOLEAN DEFAULT FALSE,
  parties_edit_any BOOLEAN DEFAULT FALSE,
  parties_delete_own BOOLEAN DEFAULT FALSE,
  parties_delete_any BOOLEAN DEFAULT FALSE,
  
  -- Siege permissions
  siege_view_rosters BOOLEAN DEFAULT TRUE,
  siege_edit_rosters BOOLEAN DEFAULT FALSE,
  siege_create_event BOOLEAN DEFAULT FALSE,
  
  -- Announcement permissions
  announcements_create BOOLEAN DEFAULT FALSE,
  announcements_edit BOOLEAN DEFAULT FALSE,
  announcements_delete BOOLEAN DEFAULT FALSE,
  
  -- Recruitment permissions
  recruitment_manage BOOLEAN DEFAULT FALSE,
  
  -- Settings permissions
  settings_edit BOOLEAN DEFAULT FALSE,
  settings_edit_roles BOOLEAN DEFAULT FALSE,
  settings_view_permissions BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(clan_id, role)
);

-- Create index for faster lookups by clan and role
CREATE INDEX idx_clan_permission_overrides_clan_role 
  ON clan_permission_overrides(clan_id, role);

-- Enable RLS
ALTER TABLE clan_permission_overrides ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: admins can view and modify permissions for their clan
CREATE POLICY "clan_admins_can_manage_permissions" ON clan_permission_overrides
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM clan_members 
      WHERE clan_id = clan_permission_overrides.clan_id 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM clan_members 
      WHERE clan_id = clan_permission_overrides.clan_id 
      AND role = 'admin'
    )
  );

-- Create RLS policy: members can view their own clan's permission structure
CREATE POLICY "clan_members_can_view_permissions" ON clan_permission_overrides
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM clan_members 
      WHERE clan_id = clan_permission_overrides.clan_id
    )
  );

COMMIT;
