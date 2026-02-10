-- Fix missing RLS policies for groups table
-- The INSERT and SELECT policies were not recreated after migration 047

BEGIN;

-- Allow anyone authenticated to view groups (needed for group search, public pages, etc.)
CREATE POLICY IF NOT EXISTS "Anyone can view groups" 
  ON groups 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow anyone authenticated to create a new group
CREATE POLICY IF NOT EXISTS "Anyone can create group" 
  ON groups 
  FOR INSERT 
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow group admins to delete their groups
CREATE POLICY IF NOT EXISTS "Admin can delete group" 
  ON groups 
  FOR DELETE 
  USING (user_has_clan_role(id, auth.uid(), ARRAY['admin'::text]));

COMMIT;
