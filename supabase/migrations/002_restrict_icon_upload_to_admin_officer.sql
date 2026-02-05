-- Restrict guild icon upload/update to admins and officers only
-- Members and trials should not be able to upload group icons

DROP POLICY IF EXISTS "Authenticated users can upload guild icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update guild icons" ON storage.objects;

-- Policy: Only admins and officers can upload guild icons
CREATE POLICY "Authenticated users can upload guild icons"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'aoc-guild-icons'
    AND (storage.foldername(name))[1] IN (
      SELECT group_id::text 
      FROM group_members 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'officer')
    )
  );

-- Policy: Only admins and officers can update guild icons (upsert)
CREATE POLICY "Authenticated users can update guild icons"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'aoc-guild-icons'
    AND (storage.foldername(name))[1] IN (
      SELECT group_id::text 
      FROM group_members 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'officer')
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
INSERT INTO migration_history (filename) VALUES ('002_restrict_icon_upload_to_admin_officer.sql')
  ON CONFLICT (filename) DO NOTHING;
