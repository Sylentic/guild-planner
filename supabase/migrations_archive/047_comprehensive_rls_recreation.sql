-- Comprehensive RLS policy recreation
-- This migration handles:
-- 1. Adding missing group_id and user_id columns to tables
-- 2. Dropping all existing RLS policies
-- 3. Recreating all RLS policies with correct column references
-- This replaces migration 055

DO $$
BEGIN
  -- Add missing group_id columns where needed (idempotent)
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='bank_transactions' AND column_name='group_id') THEN
    ALTER TABLE bank_transactions ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='bank_inventory' AND column_name='group_id') THEN
    ALTER TABLE bank_inventory ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='dkp_points' AND column_name='group_id') THEN
    ALTER TABLE dkp_points ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='dkp_transactions' AND column_name='group_id') THEN
    ALTER TABLE dkp_transactions ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='loot_history' AND column_name='group_id') THEN
    ALTER TABLE loot_history ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='event_rsvps' AND column_name='group_id') THEN
    ALTER TABLE event_rsvps ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='guest_event_rsvps' AND column_name='group_id') THEN
    ALTER TABLE guest_event_rsvps ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='build_comments' AND column_name='group_id') THEN
    ALTER TABLE build_comments ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='member_professions' AND column_name='group_id') THEN
    ALTER TABLE member_professions ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='node_citizenships' AND column_name='group_id') THEN
    ALTER TABLE node_citizenships ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='party_roster' AND column_name='group_id') THEN
    ALTER TABLE party_roster ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='caravan_escorts' AND column_name='group_id') THEN
    ALTER TABLE caravan_escorts ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='caravan_waypoints' AND column_name='group_id') THEN
    ALTER TABLE caravan_waypoints ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='freehold_buildings' AND column_name='group_id') THEN
    ALTER TABLE freehold_buildings ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='freehold_schedules' AND column_name='group_id') THEN
    ALTER TABLE freehold_schedules ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='siege_roster' AND column_name='group_id') THEN
    ALTER TABLE siege_roster ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='resource_requests' AND column_name='group_id') THEN
    ALTER TABLE resource_requests ADD COLUMN group_id uuid REFERENCES groups(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='guest_event_rsvps' AND column_name='user_id') THEN
    ALTER TABLE guest_event_rsvps ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='member_professions' AND column_name='user_id') THEN
    ALTER TABLE member_professions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='party_roster' AND column_name='user_id') THEN
    ALTER TABLE party_roster ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='resource_requests' AND column_name='user_id') THEN
    ALTER TABLE resource_requests ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Admin can update groups" ON groups;
DROP POLICY IF EXISTS "Approved members can add characters" ON members;
DROP POLICY IF EXISTS "Approved members can view members" ON members;
DROP POLICY IF EXISTS "Members can update own characters" ON members;
DROP POLICY IF EXISTS "Members can delete own characters" ON members;
DROP POLICY IF EXISTS "View professions if can view member" ON member_professions;
DROP POLICY IF EXISTS "Members can modify own character professions" ON member_professions;
DROP POLICY IF EXISTS "Officers+ can create events" ON events;
DROP POLICY IF EXISTS "Officers+ can update events" ON events;
DROP POLICY IF EXISTS "Officers+ can delete events" ON events;
DROP POLICY IF EXISTS "Clan members can view announcements" ON announcements;
DROP POLICY IF EXISTS "Officers+ can create announcements" ON announcements;
DROP POLICY IF EXISTS "Officers+ can update announcements" ON announcements;
DROP POLICY IF EXISTS "Officers+ can delete announcements" ON announcements;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "Clan members can view parties" ON parties;
DROP POLICY IF EXISTS "Officers can manage parties" ON parties;
DROP POLICY IF EXISTS "Clan members can view roster" ON party_roster;
DROP POLICY IF EXISTS "Officers can manage roster" ON party_roster;
DROP POLICY IF EXISTS "Officers can manage applications" ON recruitment_applications;
DROP POLICY IF EXISTS "Officers can update applications" ON recruitment_applications;
DROP POLICY IF EXISTS "Clan members can view citizenships" ON node_citizenships;
DROP POLICY IF EXISTS "Officers can manage clan citizenships" ON node_citizenships;
DROP POLICY IF EXISTS "Clan members can view sieges" ON siege_events;
DROP POLICY IF EXISTS "Officers can manage sieges" ON siege_events;
DROP POLICY IF EXISTS "Clan members can view siege roster" ON siege_roster;
DROP POLICY IF EXISTS "Members can withdraw or officers manage siege roster" ON siege_roster;
DROP POLICY IF EXISTS "Clan members can view loot systems" ON loot_systems;
DROP POLICY IF EXISTS "Officers can manage loot systems" ON loot_systems;
DROP POLICY IF EXISTS "Clan members can view DKP" ON dkp_points;
DROP POLICY IF EXISTS "Officers can manage DKP" ON dkp_points;
DROP POLICY IF EXISTS "Clan members can view loot history" ON loot_history;
DROP POLICY IF EXISTS "Officers can manage loot history" ON loot_history;
DROP POLICY IF EXISTS "Clan members can view transactions" ON dkp_transactions;
DROP POLICY IF EXISTS "Officers can manage transactions" ON dkp_transactions;
DROP POLICY IF EXISTS "Clan members can view bank" ON guild_banks;
DROP POLICY IF EXISTS "Officers can manage bank" ON guild_banks;
DROP POLICY IF EXISTS "Clan members can view inventory" ON bank_inventory;
DROP POLICY IF EXISTS "Officers can manage inventory" ON bank_inventory;
DROP POLICY IF EXISTS "Clan members can view bank transactions" ON bank_transactions;
DROP POLICY IF EXISTS "Members can create bank transactions" ON bank_transactions;
DROP POLICY IF EXISTS "Users can view own requests or officers all" ON resource_requests;
DROP POLICY IF EXISTS "Members can create requests" ON resource_requests;
DROP POLICY IF EXISTS "Officers can review requests" ON resource_requests;
DROP POLICY IF EXISTS "Clan members can view freeholds" ON freeholds;
DROP POLICY IF EXISTS "Officers can manage all freeholds" ON freeholds;
DROP POLICY IF EXISTS "Clan members can view buildings" ON freehold_buildings;
DROP POLICY IF EXISTS "Clan members can view schedules" ON freehold_schedules;
DROP POLICY IF EXISTS "Clan members can view caravans" ON caravan_events;
DROP POLICY IF EXISTS "Members can create caravans" ON caravan_events;
DROP POLICY IF EXISTS "Creators and officers can update caravans" ON caravan_events;
DROP POLICY IF EXISTS "Creators and officers can delete caravans" ON caravan_events;
DROP POLICY IF EXISTS "Clan members can view escorts" ON caravan_escorts;
DROP POLICY IF EXISTS "Members can withdraw from escort" ON caravan_escorts;
DROP POLICY IF EXISTS "Clan members can view waypoints" ON caravan_waypoints;
DROP POLICY IF EXISTS "Creators can manage waypoints" ON caravan_waypoints;
DROP POLICY IF EXISTS "Leader can manage alliance" ON alliances;
DROP POLICY IF EXISTS "Leader can manage memberships" ON alliance_members;
DROP POLICY IF EXISTS "Clan officers can update participation" ON alliance_event_participation;
DROP POLICY IF EXISTS "Officers can view activity log" ON activity_log;
DROP POLICY IF EXISTS "Can log own activity" ON activity_log;
DROP POLICY IF EXISTS "Officers can view activity summary" ON member_activity_summary;
DROP POLICY IF EXISTS "System manages summaries" ON member_activity_summary;
DROP POLICY IF EXISTS "Officers can view alerts" ON inactivity_alerts;
DROP POLICY IF EXISTS "Officers can manage alerts" ON inactivity_alerts;
DROP POLICY IF EXISTS "Clan members can view achievements" ON group_achievements;
DROP POLICY IF EXISTS "System manages achievements" ON group_achievements;
DROP POLICY IF EXISTS "Officers can view notifications" ON achievement_notifications;
DROP POLICY IF EXISTS "Officers can manage notifications" ON achievement_notifications;
DROP POLICY IF EXISTS "View builds based on visibility" ON builds;
DROP POLICY IF EXISTS "Comments visible with build" ON build_comments;
DROP POLICY IF EXISTS "Admins can manage guest RSVPs" ON guest_event_rsvps;
DROP POLICY IF EXISTS "Admins can delete guest RSVPs" ON guest_event_rsvps;
DROP POLICY IF EXISTS "Users can update own RSVP" ON event_rsvps;

-- Recreate all RLS policies with correct column references
CREATE POLICY "Admin can update groups" ON groups FOR UPDATE USING (user_has_clan_role(id, auth.uid(), ARRAY['admin'::text]));

CREATE POLICY "Approved members can add characters" ON members FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Approved members can view members" ON members FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Members can update own characters" ON members FOR UPDATE USING ((user_id = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text]));
CREATE POLICY "Members can delete own characters" ON members FOR DELETE USING ((user_id = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text]));

CREATE POLICY "View professions if can view member" ON member_professions FOR SELECT USING (true);
CREATE POLICY "Members can modify own character professions" ON member_professions FOR UPDATE USING ((user_id = auth.uid()));

CREATE POLICY "Officers+ can create events" ON events FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers+ can update events" ON events FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers+ can delete events" ON events FOR DELETE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view announcements" ON announcements FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers+ can create announcements" ON announcements FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers+ can update announcements" ON announcements FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers+ can delete announcements" ON announcements FOR DELETE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "group_members_update" ON group_members FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text]));
CREATE POLICY "group_members_delete" ON group_members FOR DELETE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text]));

CREATE POLICY "Clan members can view parties" ON parties FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage parties" ON parties FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view roster" ON party_roster FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage roster" ON party_roster FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Officers can manage applications" ON recruitment_applications FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers can update applications" ON recruitment_applications FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view citizenships" ON node_citizenships FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage clan citizenships" ON node_citizenships FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view sieges" ON siege_events FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage sieges" ON siege_events FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view siege roster" ON siege_roster FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Members can withdraw or officers manage siege roster" ON siege_roster FOR UPDATE USING ((user_id = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view loot systems" ON loot_systems FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage loot systems" ON loot_systems FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view DKP" ON dkp_points FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage DKP" ON dkp_points FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view loot history" ON loot_history FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage loot history" ON loot_history FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view transactions" ON dkp_transactions FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage transactions" ON dkp_transactions FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view bank" ON guild_banks FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage bank" ON guild_banks FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view inventory" ON bank_inventory FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage inventory" ON bank_inventory FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view bank transactions" ON bank_transactions FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Members can create bank transactions" ON bank_transactions FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Users can view own requests or officers all" ON resource_requests FOR SELECT USING ((user_id = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Members can create requests" ON resource_requests FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can review requests" ON resource_requests FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view freeholds" ON freeholds FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Officers can manage all freeholds" ON freeholds FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view buildings" ON freehold_buildings FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Clan members can view schedules" ON freehold_schedules FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Clan members can view caravans" ON caravan_events FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Members can create caravans" ON caravan_events FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Creators and officers can update caravans" ON caravan_events FOR UPDATE USING ((created_by = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Creators and officers can delete caravans" ON caravan_events FOR DELETE USING ((created_by = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view escorts" ON caravan_escorts FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Members can withdraw from escort" ON caravan_escorts FOR UPDATE USING ((user_id = auth.uid()));

CREATE POLICY "Clan members can view waypoints" ON caravan_waypoints FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "Creators can manage waypoints" ON caravan_waypoints FOR INSERT WITH CHECK ((SELECT created_by FROM caravan_events WHERE id = caravan_id) = auth.uid());

CREATE POLICY "Leader can manage alliance" ON alliances FOR UPDATE USING (user_has_clan_role(leader_group_id, auth.uid(), ARRAY['admin'::text]));

CREATE POLICY "Leader can manage memberships" ON alliance_members FOR INSERT WITH CHECK (user_has_clan_role((SELECT leader_group_id FROM alliances WHERE id = alliance_id), auth.uid(), ARRAY['admin'::text]));

CREATE POLICY "Clan officers can update participation" ON alliance_event_participation FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Officers can view activity log" ON activity_log FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Can log own activity" ON activity_log FOR INSERT WITH CHECK (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Officers can view activity summary" ON member_activity_summary FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "System manages summaries" ON member_activity_summary FOR INSERT WITH CHECK (true);

CREATE POLICY "Officers can view alerts" ON inactivity_alerts FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers can manage alerts" ON inactivity_alerts FOR UPDATE USING (user_has_clan_role(group_id, auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "Clan members can view achievements" ON group_achievements FOR SELECT USING (user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));
CREATE POLICY "System manages achievements" ON group_achievements FOR INSERT WITH CHECK (true);

CREATE POLICY "Officers can view notifications" ON achievement_notifications FOR SELECT USING (user_has_clan_role((SELECT group_id FROM group_achievements WHERE id = achievement_id), auth.uid(), ARRAY['officer'::text, 'admin'::text]));
CREATE POLICY "Officers can manage notifications" ON achievement_notifications FOR INSERT WITH CHECK (user_has_clan_role((SELECT group_id FROM group_achievements WHERE id = achievement_id), auth.uid(), ARRAY['officer'::text, 'admin'::text]));

CREATE POLICY "View builds based on visibility" ON builds FOR SELECT USING ((visibility = 'public') OR (created_by = auth.uid()) OR user_has_clan_role(group_id, auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Comments visible with build" ON build_comments FOR SELECT USING ((SELECT visibility FROM builds WHERE id = build_id) = 'public' OR (SELECT created_by FROM builds WHERE id = build_id) = auth.uid() OR user_has_clan_role((SELECT group_id FROM builds WHERE id = build_id), auth.uid(), ARRAY['admin'::text, 'officer'::text, 'member'::text]));

CREATE POLICY "Admins can manage guest RSVPs" ON guest_event_rsvps FOR INSERT WITH CHECK (user_has_clan_role((SELECT group_id FROM events WHERE id = event_id), auth.uid(), ARRAY['admin'::text]));
CREATE POLICY "Admins can delete guest RSVPs" ON guest_event_rsvps FOR DELETE USING (user_has_clan_role((SELECT group_id FROM events WHERE id = event_id), auth.uid(), ARRAY['admin'::text]));

CREATE POLICY "Users can update own RSVP" ON event_rsvps FOR UPDATE USING ((user_id = auth.uid()));

INSERT INTO migration_history (filename) VALUES ('047_comprehensive_rls_recreation.sql') ON CONFLICT DO NOTHING;
