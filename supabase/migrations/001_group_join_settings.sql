-- Add approval requirement flag and default role for group membership
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS approval_required BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_role VARCHAR(20) NOT NULL DEFAULT 'trial'
    CHECK (default_role IN ('trial', 'member'));

-- Allow auto-approved joins when approval is disabled
-- The role must match the group's configured default_role
DROP POLICY IF EXISTS "clan_members_insert_auto_approved" ON group_members;

CREATE POLICY "clan_members_insert_auto_approved"
  ON group_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role IN ('trial', 'member')
    AND EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id
        AND g.approval_required = false
        AND g.default_role = group_members.role
    )
  );

-- Add unique constraint to migration_history if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'migration_history_filename_key'
  ) THEN
    ALTER TABLE migration_history ADD CONSTRAINT migration_history_filename_key UNIQUE (filename);
  END IF;
END $$;

-- Record migration
INSERT INTO migration_history (filename) VALUES ('001_group_join_settings.sql')
  ON CONFLICT (filename) DO NOTHING;
