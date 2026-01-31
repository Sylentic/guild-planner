-- Migration: Add helper function to check if clans are allied
-- Purpose: Validate that guest's clan is allied with event's clan

CREATE OR REPLACE FUNCTION check_clans_allied(clan_a UUID, clan_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM alliance_members am1
    INNER JOIN alliance_members am2 ON am1.alliance_id = am2.alliance_id
    WHERE am1.clan_id = clan_a
    AND am2.clan_id = clan_b
    AND am1.status = 'approved'
    AND am2.status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('039_add_check_clans_allied_function.sql');
