-- Create storage bucket for guild icons
-- This bucket stores uploaded guild/group icons

BEGIN;

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aoc-guild-icons',
  'aoc-guild-icons',
  true,  -- public bucket so icons can be displayed without authentication
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public Access for Guild Icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload guild icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update guild icons" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can delete guild icons" ON storage.objects;

-- Policy: Anyone can view guild icons (since bucket is public)
CREATE POLICY "Public Access for Guild Icons"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aoc-guild-icons');

-- Policy: Authenticated users can upload guild icons
CREATE POLICY "Authenticated users can upload guild icons"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'aoc-guild-icons'
    AND (storage.foldername(name))[1] IN (
      -- Only allow uploads to folders matching group IDs where user is a member
      SELECT group_id::text 
      FROM group_members 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'officer', 'member')
    )
  );

-- Policy: Authenticated users can update their guild icons (upsert)
CREATE POLICY "Authenticated users can update guild icons"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'aoc-guild-icons'
    AND (storage.foldername(name))[1] IN (
      SELECT group_id::text 
      FROM group_members 
      WHERE user_id = auth.uid() 
        AND role IN ('admin', 'officer', 'member')
    )
  );

-- Policy: Group admins/officers can delete guild icons
CREATE POLICY "Group admins can delete guild icons"
  ON storage.objects FOR DELETE
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

COMMIT;
