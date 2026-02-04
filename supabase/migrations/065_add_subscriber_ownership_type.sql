-- Add subscriber ownership type for monthly subscriber perks
-- This allows explicit tracking of subscriber-exclusive ships

-- Drop the existing CHECK constraint
ALTER TABLE character_ships DROP CONSTRAINT IF EXISTS character_ships_ownership_type_check;

-- Add the new CHECK constraint with subscriber option
ALTER TABLE character_ships ADD CONSTRAINT character_ships_ownership_type_check 
  CHECK (ownership_type IN ('pledged', 'in-game', 'loaner', 'subscriber'));

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('065_add_subscriber_ownership_type.sql') ON CONFLICT DO NOTHING;
