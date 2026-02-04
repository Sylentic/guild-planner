-- Manual script to sync subscriber ships for a character
-- Replace the character_id and tier below with your actual values

-- Example: Sync Imperator ships for QuarterBall character
-- First, check if character has subscriber_tier set
SELECT id, name, subscriber_tier, subscriber_since, subscriber_ships_month 
FROM members 
WHERE name = 'QuarterBall';

-- If subscriber_tier is not set, update it first:
-- UPDATE members SET subscriber_tier = 'imperator', subscriber_since = '2024-07-07' WHERE name = 'QuarterBall';

-- Then manually insert subscriber ships (example for February 2026)
-- Replace 'YOUR_CHARACTER_ID' with the actual character ID from the SELECT above

/*
INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
VALUES 
  ('YOUR_CHARACTER_ID', 'perseus', 'subscriber', 'imperator subscriber perk (2026-02)'),
  ('YOUR_CHARACTER_ID', 'hermes', 'subscriber', 'imperator subscriber perk (2026-02)')
ON CONFLICT (character_id, ship_id, ownership_type) DO NOTHING;

-- Update the subscriber_ships_month field
UPDATE members 
SET subscriber_ships_month = '2026-02' 
WHERE id = 'YOUR_CHARACTER_ID';
*/
