-- =====================================================
-- Backfill user_id for existing characters
-- Links characters to their creator based on clan membership
-- =====================================================

-- Update characters to have the user_id of the user who can edit them
-- This matches characters with clan members who have edit permissions
UPDATE members m
SET user_id = cm.user_id
FROM clan_members cm
WHERE m.clan_id = cm.clan_id
  AND m.user_id IS NULL
  AND cm.role IN ('admin', 'officer', 'member')
  AND cm.clan_id IN (
    -- Only update for clans where there's a single non-pending member
    -- to avoid ambiguity
    SELECT clan_id 
    FROM clan_members 
    WHERE role IN ('admin', 'officer', 'member')
    GROUP BY clan_id 
    HAVING COUNT(*) = 1
  );

-- For clans with multiple members, you'll need to manually assign characters
-- or let users edit their characters to automatically claim them
COMMENT ON TABLE members IS 'Characters in clans. user_id links characters to their owner for automatic main/alt detection.';
