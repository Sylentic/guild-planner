-- Add loaner ship matrix table for Star Citizen
-- Stores the official loaner ship mappings from RSI

CREATE TABLE IF NOT EXISTS sc_loaner_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledged_ship TEXT NOT NULL, -- The ship that is pledged (not flight ready)
  loaner_ship TEXT NOT NULL, -- The ship provided as a loaner
  loaner_type TEXT DEFAULT 'primary' CHECK (loaner_type IN ('primary', 'arena_commander', 'temporary')),
  notes TEXT, -- Additional notes (e.g., "for Arena Commander", "temporary due to bug")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pledged_ship, loaner_ship, loaner_type)
);

-- Index for looking up loaners by pledged ship
CREATE INDEX IF NOT EXISTS idx_sc_loaner_matrix_pledged 
  ON sc_loaner_matrix(pledged_ship);

-- Index for finding which pledged ships grant a specific loaner
CREATE INDEX IF NOT EXISTS idx_sc_loaner_matrix_loaner 
  ON sc_loaner_matrix(loaner_ship);

-- RLS Policies
ALTER TABLE sc_loaner_matrix ENABLE ROW LEVEL SECURITY;

-- Everyone can read the loaner matrix (it's public data from RSI)
CREATE POLICY "Everyone can view loaner matrix"
  ON sc_loaner_matrix
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update the loaner matrix
CREATE POLICY "Only service role can update loaner matrix"
  ON sc_loaner_matrix
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to automatically add loaner ships when a pledged ship is added
CREATE OR REPLACE FUNCTION add_loaner_ships_for_pledge()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process pledged ships (not in-game or existing loaners)
  IF NEW.ownership_type = 'pledged' THEN
    -- Add all loaners for this pledged ship
    INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
    SELECT 
      NEW.character_id,
      loaner_ship,
      'loaner',
      'Auto-granted loaner for ' || NEW.ship_id || 
      CASE 
        WHEN loaner_type = 'arena_commander' THEN ' (Arena Commander)'
        WHEN loaner_type = 'temporary' THEN ' (Temporary: ' || COALESCE(notes, 'see RSI') || ')'
        ELSE ''
      END
    FROM sc_loaner_matrix
    WHERE pledged_ship = NEW.ship_id
    ON CONFLICT (character_id, ship_id, ownership_type) DO NOTHING; -- Don't duplicate loaners
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add loaners when pledged ships are added
DROP TRIGGER IF EXISTS trigger_add_loaner_ships ON character_ships;
CREATE TRIGGER trigger_add_loaner_ships
  AFTER INSERT ON character_ships
  FOR EACH ROW
  EXECUTE FUNCTION add_loaner_ships_for_pledge();

-- Function to remove loaner ships when the pledged ship is removed
CREATE OR REPLACE FUNCTION remove_loaner_ships_for_pledge()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process pledged ships
  IF OLD.ownership_type = 'pledged' THEN
    -- Check if this was the last/only pledge granting these loaners
    -- Don't remove loaners that are still granted by other pledges
    DELETE FROM character_ships cs
    WHERE cs.character_id = OLD.character_id
    AND cs.ownership_type = 'loaner'
    AND cs.ship_id IN (
      SELECT loaner_ship 
      FROM sc_loaner_matrix 
      WHERE pledged_ship = OLD.ship_id
    )
    -- Only delete if no other pledges grant this loaner
    AND NOT EXISTS (
      SELECT 1 
      FROM character_ships other_pledges
      JOIN sc_loaner_matrix lm ON lm.pledged_ship = other_pledges.ship_id
      WHERE other_pledges.character_id = OLD.character_id
      AND other_pledges.ownership_type = 'pledged'
      AND other_pledges.id != OLD.id
      AND lm.loaner_ship = cs.ship_id
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to remove loaners when pledged ships are removed
DROP TRIGGER IF EXISTS trigger_remove_loaner_ships ON character_ships;
CREATE TRIGGER trigger_remove_loaner_ships
  BEFORE DELETE ON character_ships
  FOR EACH ROW
  EXECUTE FUNCTION remove_loaner_ships_for_pledge();

COMMIT;
