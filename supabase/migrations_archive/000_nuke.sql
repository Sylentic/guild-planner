-- =====================================================
-- 000_nuke.sql - DROP ALL TABLES AND FUNCTIONS
-- ⚠️  WARNING: This will DELETE ALL DATA!
-- Only use for testing/development reset
-- Updated to include migrations 001-016
-- Uses exception handling to continue on errors
-- =====================================================

-- Create helper function to safely drop objects (ignores errors)
CREATE OR REPLACE FUNCTION safe_drop(command TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE command;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipped (does not exist or error): %', command;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DROP ALL POLICIES (016_builds.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "builds_select" ON builds');
SELECT safe_drop('DROP POLICY IF EXISTS "builds_insert" ON builds');
SELECT safe_drop('DROP POLICY IF EXISTS "builds_update" ON builds');
SELECT safe_drop('DROP POLICY IF EXISTS "builds_delete" ON builds');
SELECT safe_drop('DROP POLICY IF EXISTS "build_likes_select" ON build_likes');
SELECT safe_drop('DROP POLICY IF EXISTS "build_likes_insert" ON build_likes');
SELECT safe_drop('DROP POLICY IF EXISTS "build_likes_delete" ON build_likes');
SELECT safe_drop('DROP POLICY IF EXISTS "build_comments_select" ON build_comments');
SELECT safe_drop('DROP POLICY IF EXISTS "build_comments_insert" ON build_comments');
SELECT safe_drop('DROP POLICY IF EXISTS "build_comments_update" ON build_comments');
SELECT safe_drop('DROP POLICY IF EXISTS "build_comments_delete" ON build_comments');
SELECT safe_drop('DROP POLICY IF EXISTS "skill_definitions_select" ON skill_definitions');
SELECT safe_drop('DROP POLICY IF EXISTS "augment_definitions_select" ON augment_definitions');

-- =====================================================
-- DROP ALL POLICIES (015_achievements.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "achievement_definitions_select" ON achievement_definitions');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_achievements_select" ON clan_achievements');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_achievements_insert" ON clan_achievements');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_achievements_update" ON clan_achievements');
SELECT safe_drop('DROP POLICY IF EXISTS "achievement_notifications_select" ON achievement_notifications');
SELECT safe_drop('DROP POLICY IF EXISTS "achievement_notifications_insert" ON achievement_notifications');
SELECT safe_drop('DROP POLICY IF EXISTS "achievement_notifications_update" ON achievement_notifications');

-- =====================================================
-- DROP ALL POLICIES (014_activity.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "activity_log_select" ON activity_log');
SELECT safe_drop('DROP POLICY IF EXISTS "activity_log_insert" ON activity_log');
SELECT safe_drop('DROP POLICY IF EXISTS "member_activity_summary_select" ON member_activity_summary');
SELECT safe_drop('DROP POLICY IF EXISTS "member_activity_summary_all" ON member_activity_summary');
SELECT safe_drop('DROP POLICY IF EXISTS "inactivity_alerts_select" ON inactivity_alerts');
SELECT safe_drop('DROP POLICY IF EXISTS "inactivity_alerts_all" ON inactivity_alerts');

-- =====================================================
-- DROP ALL POLICIES (013_alliances.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "alliances_select" ON alliances');
SELECT safe_drop('DROP POLICY IF EXISTS "alliances_insert" ON alliances');
SELECT safe_drop('DROP POLICY IF EXISTS "alliances_update" ON alliances');
SELECT safe_drop('DROP POLICY IF EXISTS "alliances_delete" ON alliances');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_members_select" ON alliance_members');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_members_insert" ON alliance_members');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_members_update" ON alliance_members');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_members_delete" ON alliance_members');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_events_select" ON alliance_events');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_events_insert" ON alliance_events');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_events_update" ON alliance_events');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_event_participation_select" ON alliance_event_participation');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_event_participation_insert" ON alliance_event_participation');
SELECT safe_drop('DROP POLICY IF EXISTS "alliance_event_participation_update" ON alliance_event_participation');

-- =====================================================
-- DROP ALL POLICIES (012_caravans.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_events_select" ON caravan_events');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_events_insert" ON caravan_events');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_events_update" ON caravan_events');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_events_delete" ON caravan_events');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_escorts_select" ON caravan_escorts');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_escorts_insert" ON caravan_escorts');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_escorts_update" ON caravan_escorts');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_escorts_delete" ON caravan_escorts');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_waypoints_select" ON caravan_waypoints');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_waypoints_insert" ON caravan_waypoints');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_waypoints_update" ON caravan_waypoints');
SELECT safe_drop('DROP POLICY IF EXISTS "caravan_waypoints_delete" ON caravan_waypoints');

-- =====================================================
-- DROP ALL POLICIES (011_freeholds.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "freeholds_select" ON freeholds');
SELECT safe_drop('DROP POLICY IF EXISTS "freeholds_insert" ON freeholds');
SELECT safe_drop('DROP POLICY IF EXISTS "freeholds_update" ON freeholds');
SELECT safe_drop('DROP POLICY IF EXISTS "freeholds_delete" ON freeholds');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_buildings_select" ON freehold_buildings');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_buildings_insert" ON freehold_buildings');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_buildings_update" ON freehold_buildings');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_buildings_delete" ON freehold_buildings');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_schedules_select" ON freehold_schedules');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_schedules_insert" ON freehold_schedules');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_schedules_update" ON freehold_schedules');
SELECT safe_drop('DROP POLICY IF EXISTS "freehold_schedules_delete" ON freehold_schedules');

-- =====================================================
-- DROP ALL POLICIES (010_guild_bank.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "guild_banks_select" ON guild_banks');
SELECT safe_drop('DROP POLICY IF EXISTS "guild_banks_insert" ON guild_banks');
SELECT safe_drop('DROP POLICY IF EXISTS "guild_banks_update" ON guild_banks');
SELECT safe_drop('DROP POLICY IF EXISTS "resource_catalog_select" ON resource_catalog');
SELECT safe_drop('DROP POLICY IF EXISTS "bank_inventory_select" ON bank_inventory');
SELECT safe_drop('DROP POLICY IF EXISTS "bank_inventory_insert" ON bank_inventory');
SELECT safe_drop('DROP POLICY IF EXISTS "bank_inventory_update" ON bank_inventory');
SELECT safe_drop('DROP POLICY IF EXISTS "bank_transactions_select" ON bank_transactions');
SELECT safe_drop('DROP POLICY IF EXISTS "bank_transactions_insert" ON bank_transactions');
SELECT safe_drop('DROP POLICY IF EXISTS "resource_requests_select" ON resource_requests');
SELECT safe_drop('DROP POLICY IF EXISTS "resource_requests_insert" ON resource_requests');
SELECT safe_drop('DROP POLICY IF EXISTS "resource_requests_update" ON resource_requests');

-- =====================================================
-- DROP ALL POLICIES (009_loot_dkp.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "loot_systems_select" ON loot_systems');
SELECT safe_drop('DROP POLICY IF EXISTS "loot_systems_insert" ON loot_systems');
SELECT safe_drop('DROP POLICY IF EXISTS "loot_systems_update" ON loot_systems');
SELECT safe_drop('DROP POLICY IF EXISTS "dkp_points_select" ON dkp_points');
SELECT safe_drop('DROP POLICY IF EXISTS "dkp_points_insert" ON dkp_points');
SELECT safe_drop('DROP POLICY IF EXISTS "dkp_points_update" ON dkp_points');
SELECT safe_drop('DROP POLICY IF EXISTS "dkp_transactions_select" ON dkp_transactions');
SELECT safe_drop('DROP POLICY IF EXISTS "dkp_transactions_insert" ON dkp_transactions');
SELECT safe_drop('DROP POLICY IF EXISTS "loot_history_select" ON loot_history');
SELECT safe_drop('DROP POLICY IF EXISTS "loot_history_insert" ON loot_history');
SELECT safe_drop('DROP POLICY IF EXISTS "loot_history_update" ON loot_history');

-- =====================================================
-- DROP ALL POLICIES (008_siege_rosters.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "siege_events_select" ON siege_events');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_events_insert" ON siege_events');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_events_update" ON siege_events');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_events_delete" ON siege_events');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_roster_select" ON siege_roster');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_roster_insert" ON siege_roster');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_roster_update" ON siege_roster');
SELECT safe_drop('DROP POLICY IF EXISTS "siege_roster_delete" ON siege_roster');

-- =====================================================
-- DROP ALL POLICIES (007_node_citizenship.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "node_citizenships_select" ON node_citizenships');
SELECT safe_drop('DROP POLICY IF EXISTS "node_citizenships_insert" ON node_citizenships');
SELECT safe_drop('DROP POLICY IF EXISTS "node_citizenships_update" ON node_citizenships');
SELECT safe_drop('DROP POLICY IF EXISTS "node_citizenships_delete" ON node_citizenships');

-- =====================================================
-- DROP ALL POLICIES (005_parties.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "Anyone can submit applications" ON recruitment_applications');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers can manage applications" ON recruitment_applications');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers can update applications" ON recruitment_applications');
SELECT safe_drop('DROP POLICY IF EXISTS "Clan members can view roster" ON party_roster');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers can manage roster" ON party_roster');
SELECT safe_drop('DROP POLICY IF EXISTS "Clan members can view parties" ON parties');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers can manage parties" ON parties');

-- =====================================================
-- DROP ALL POLICIES (003_events.sql)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "Clan members can view announcements" ON announcements');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can create announcements" ON announcements');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can update announcements" ON announcements');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can delete announcements" ON announcements');
SELECT safe_drop('DROP POLICY IF EXISTS "Clan members can view RSVPs" ON event_rsvps');
SELECT safe_drop('DROP POLICY IF EXISTS "Members can RSVP" ON event_rsvps');
SELECT safe_drop('DROP POLICY IF EXISTS "Users can update own RSVP" ON event_rsvps');
SELECT safe_drop('DROP POLICY IF EXISTS "Users can delete own RSVP" ON event_rsvps');
SELECT safe_drop('DROP POLICY IF EXISTS "Clan members can view events" ON events');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can create events" ON events');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can update events" ON events');
SELECT safe_drop('DROP POLICY IF EXISTS "Officers+ can delete events" ON events');

-- =====================================================
-- DROP ALL POLICIES (001_initial_schema.sql + 006)
-- =====================================================
SELECT safe_drop('DROP POLICY IF EXISTS "View professions if can view member" ON member_professions');
SELECT safe_drop('DROP POLICY IF EXISTS "Modify professions" ON member_professions');
SELECT safe_drop('DROP POLICY IF EXISTS "Approved members can view members" ON members');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin/Officer manage members" ON members');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin/Officer update members" ON members');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin/Officer delete members" ON members');
SELECT safe_drop('DROP POLICY IF EXISTS "Users can view own membership" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Clan managers can view members" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Anyone can apply to clan" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Creator becomes admin" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin/Officer manage memberships" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin can remove or user can leave" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_members_select" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_members_insert_pending" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_members_insert_creator" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_members_update" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "clan_members_delete" ON clan_members');
SELECT safe_drop('DROP POLICY IF EXISTS "Anyone can view clans" ON clans');
SELECT safe_drop('DROP POLICY IF EXISTS "Anyone can create clan" ON clans');
SELECT safe_drop('DROP POLICY IF EXISTS "Admin can update clan" ON clans');
SELECT safe_drop('DROP POLICY IF EXISTS "Public clans are viewable" ON clans');
SELECT safe_drop('DROP POLICY IF EXISTS "Users can view all users" ON users');
SELECT safe_drop('DROP POLICY IF EXISTS "Users can update own profile" ON users');
SELECT safe_drop('DROP POLICY IF EXISTS "Auth can insert user on signup" ON users');

-- =====================================================
-- DROP VIEWS
-- =====================================================
SELECT safe_drop('DROP VIEW IF EXISTS node_distribution CASCADE');
SELECT safe_drop('DROP VIEW IF EXISTS siege_roster_counts CASCADE');
SELECT safe_drop('DROP VIEW IF EXISTS dkp_leaderboard CASCADE');

-- =====================================================
-- DROP TRIGGERS
-- =====================================================
SELECT safe_drop('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users');

-- =====================================================
-- DROP FUNCTIONS (except safe_drop)
-- =====================================================
SELECT safe_drop('DROP FUNCTION IF EXISTS handle_new_user() CASCADE');
SELECT safe_drop('DROP FUNCTION IF EXISTS user_has_clan_role(UUID, UUID, TEXT[]) CASCADE');
SELECT safe_drop('DROP FUNCTION IF EXISTS user_in_alliance(UUID, UUID) CASCADE');

-- =====================================================
-- DROP TABLES (order matters due to foreign keys)
-- New migrations: 016 -> 007
-- =====================================================

-- 016_builds.sql
SELECT safe_drop('DROP TABLE IF EXISTS build_comments CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS build_likes CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS builds CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS augment_definitions CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS skill_definitions CASCADE');

-- 015_achievements.sql
SELECT safe_drop('DROP TABLE IF EXISTS achievement_notifications CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS clan_achievements CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS achievement_definitions CASCADE');

-- 014_activity.sql
SELECT safe_drop('DROP TABLE IF EXISTS inactivity_alerts CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS member_activity_summary CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS activity_log CASCADE');

-- 013_alliances.sql
SELECT safe_drop('DROP TABLE IF EXISTS alliance_event_participation CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS alliance_events CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS alliance_members CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS alliances CASCADE');

-- 012_caravans.sql
SELECT safe_drop('DROP TABLE IF EXISTS caravan_waypoints CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS caravan_escorts CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS caravan_events CASCADE');

-- 011_freeholds.sql
SELECT safe_drop('DROP TABLE IF EXISTS freehold_schedules CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS freehold_buildings CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS freeholds CASCADE');

-- 010_guild_bank.sql
SELECT safe_drop('DROP TABLE IF EXISTS resource_requests CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS bank_transactions CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS bank_inventory CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS resource_catalog CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS guild_banks CASCADE');

-- 009_loot_dkp.sql
SELECT safe_drop('DROP TABLE IF EXISTS loot_history CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS dkp_transactions CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS dkp_points CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS loot_systems CASCADE');

-- 008_siege_rosters.sql
SELECT safe_drop('DROP TABLE IF EXISTS siege_roster CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS siege_events CASCADE');

-- 007_node_citizenship.sql
SELECT safe_drop('DROP TABLE IF EXISTS node_citizenships CASCADE');

-- 005_parties.sql
SELECT safe_drop('DROP TABLE IF EXISTS recruitment_applications CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS party_roster CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS parties CASCADE');

-- 003_events.sql
SELECT safe_drop('DROP TABLE IF EXISTS announcements CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS event_rsvps CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS events CASCADE');

-- 001_initial_schema.sql
SELECT safe_drop('DROP TABLE IF EXISTS member_professions CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS members CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS clan_members CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS clans CASCADE');
SELECT safe_drop('DROP TABLE IF EXISTS users CASCADE');

-- =====================================================
-- DROP TYPES (all migrations)
-- =====================================================

-- 016_builds.sql
SELECT safe_drop('DROP TYPE IF EXISTS build_visibility CASCADE');

-- 015_achievements.sql
SELECT safe_drop('DROP TYPE IF EXISTS achievement_category CASCADE');

-- 014_activity.sql
SELECT safe_drop('DROP TYPE IF EXISTS activity_type CASCADE');

-- 013_alliances.sql
SELECT safe_drop('DROP TYPE IF EXISTS alliance_status CASCADE');

-- 012_caravans.sql
SELECT safe_drop('DROP TYPE IF EXISTS caravan_status CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS caravan_type CASCADE');

-- 011_freeholds.sql
SELECT safe_drop('DROP TYPE IF EXISTS freehold_size CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS freehold_building_type CASCADE');

-- 010_guild_bank.sql
SELECT safe_drop('DROP TYPE IF EXISTS request_status CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS bank_transaction_type CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS resource_category CASCADE');

-- 009_loot_dkp.sql
SELECT safe_drop('DROP TYPE IF EXISTS item_rarity CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS loot_system_type CASCADE');

-- 008_siege_rosters.sql
SELECT safe_drop('DROP TYPE IF EXISTS roster_status CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS siege_role CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS siege_type CASCADE');

-- 007_node_citizenship.sql
SELECT safe_drop('DROP TYPE IF EXISTS node_stage CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS node_type CASCADE');

-- 002_character_management.sql + 003_events.sql
SELECT safe_drop('DROP TYPE IF EXISTS race CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS archetype CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS event_type CASCADE');
SELECT safe_drop('DROP TYPE IF EXISTS rsvp_status CASCADE');

-- =====================================================
-- OPTIONAL: Clear auth.users (commented for safety)
-- =====================================================
-- DELETE FROM auth.users;

-- =====================================================
-- Cleanup helper function and confirm
-- =====================================================
DROP FUNCTION IF EXISTS safe_drop(TEXT);

DO $$ BEGIN
  RAISE NOTICE '🔥 NUKE COMPLETE - All tables, functions, policies, types, and views dropped (001-016)';
END $$;
