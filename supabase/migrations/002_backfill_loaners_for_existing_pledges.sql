-- Backfill loaner ships for existing pledged ships
-- This adds loaners that should have been added automatically but weren't
-- (e.g., ships added before the loaner matrix was populated)

BEGIN;

-- Add loaners for existing pledged ships
INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
SELECT DISTINCT
  cs.character_id,
  lm.loaner_ship,
  'loaner',
  'Auto-granted loaner for ' || cs.ship_id || 
  CASE 
    WHEN lm.loaner_type = 'arena_commander' THEN ' (Arena Commander)'
    WHEN lm.loaner_type = 'temporary' THEN ' (Temporary: ' || COALESCE(lm.notes, 'see RSI') || ')'
    ELSE ''
  END
FROM character_ships cs
JOIN sc_loaner_matrix lm ON lm.pledged_ship = cs.ship_id
WHERE cs.ownership_type = 'pledged'
  -- Don't add if the loaner already exists
  AND NOT EXISTS (
    SELECT 1 FROM character_ships existing
    WHERE existing.character_id = cs.character_id
      AND existing.ship_id = lm.loaner_ship
      AND existing.ownership_type = 'loaner'
  );

COMMIT;
