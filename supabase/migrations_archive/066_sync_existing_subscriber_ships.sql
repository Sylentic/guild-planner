-- Migration to sync subscriber ships for existing characters with subscriber tiers
-- This is a one-time migration to add subscriber ships to characters that already have subscriber_tier set
-- Ships are based on the February 2026 promotion:
--   Centurion: MISC Starlancer MAX
--   Imperator: MISC Starlancer MAX + MISC Starlancer TAC

DO $$
DECLARE
  char_record RECORD;
  v_ship_id TEXT;  -- Renamed to avoid ambiguity with column name
  month_key TEXT;
BEGIN
  -- Get current month in YYYY-MM format
  month_key := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Loop through all Star Citizen characters with subscriber_tier set
  FOR char_record IN 
    SELECT id, subscriber_tier 
    FROM members 
    WHERE game_slug = 'starcitizen' 
    AND subscriber_tier IS NOT NULL
  LOOP
    RAISE NOTICE 'Processing character % with tier %', char_record.id, char_record.subscriber_tier;
    
    -- Insert Imperator ships (Starlancer MAX + Starlancer TAC) for Imperator subscribers
    IF char_record.subscriber_tier = 'imperator' THEN
      -- MISC Starlancer MAX
      v_ship_id := 'starlancer-max';
      INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
      VALUES (char_record.id, v_ship_id, 'subscriber', 'imperator subscriber perk (' || month_key || ')')
      ON CONFLICT (character_id, ship_id, ownership_type) DO NOTHING;
      
      -- MISC Starlancer TAC
      v_ship_id := 'starlancer-tac';
      INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
      VALUES (char_record.id, v_ship_id, 'subscriber', 'imperator subscriber perk (' || month_key || ')')
      ON CONFLICT (character_id, ship_id, ownership_type) DO NOTHING;
      
      RAISE NOTICE 'Added Imperator ships (Starlancer MAX, Starlancer TAC) for character %', char_record.id;
    END IF;
    
    -- Insert Centurion ship (Starlancer MAX only) for Centurion subscribers
    IF char_record.subscriber_tier = 'centurion' THEN
      -- MISC Starlancer MAX
      v_ship_id := 'starlancer-max';
      INSERT INTO character_ships (character_id, ship_id, ownership_type, notes)
      VALUES (char_record.id, v_ship_id, 'subscriber', 'centurion subscriber perk (' || month_key || ')')
      ON CONFLICT (character_id, ship_id, ownership_type) DO NOTHING;
      
      RAISE NOTICE 'Added Centurion ship (Starlancer MAX) for character %', char_record.id;
    END IF;
    
    -- Update subscriber_ships_month
    UPDATE members 
    SET subscriber_ships_month = month_key 
    WHERE id = char_record.id;
    
  END LOOP;
  
  RAISE NOTICE 'Subscriber ship sync complete';
END $$;

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('066_sync_existing_subscriber_ships.sql') ON CONFLICT DO NOTHING;