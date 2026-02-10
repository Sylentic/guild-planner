-- Add subscriber tier support to Star Citizen characters
-- Allows tracking subscriber status and auto-assigning ships
-- Also fixes missing columns from previous migrations

ALTER TABLE members ADD COLUMN IF NOT EXISTS subscriber_tier VARCHAR(50);
-- Values: NULL, 'centurion', 'imperator'

-- Track when subscriber status was set/changed
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscriber_since TIMESTAMPTZ;

-- Track which month's ships the character has
-- Useful for syncing when new months arrive
ALTER TABLE members ADD COLUMN IF NOT EXISTS subscriber_ships_month VARCHAR(7);
-- Format: 'YYYY-MM' e.g., '2026-01'

-- Fix: Add missing rank column (migration 052 had wrong table name)
ALTER TABLE members ADD COLUMN IF NOT EXISTS rank TEXT;

-- Fix: Add missing Return of Reckoning columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS ror_faction VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS ror_class VARCHAR(50);

-- Create index for efficient subscriber queries
CREATE INDEX IF NOT EXISTS idx_members_subscriber_tier 
  ON members(subscriber_tier) 
  WHERE subscriber_tier IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN members.subscriber_tier IS 'Subscriber tier: centurion or imperator. NULL if not a subscriber.';
COMMENT ON COLUMN members.subscriber_since IS 'When the subscriber tier was first set.';
COMMENT ON COLUMN members.subscriber_ships_month IS 'Which month (YYYY-MM) of subscriber ships have been added.';
COMMENT ON COLUMN members.rank IS 'Guild rank assigned to this member/character. Values defined per-game in config.';
COMMENT ON COLUMN members.ror_faction IS 'Return of Reckoning faction: order or destruction.';
COMMENT ON COLUMN members.ror_class IS 'Return of Reckoning class ID.';

-- Track this migration
INSERT INTO migration_history (filename) VALUES ('063_add_star_citizen_subscriber_support.sql') ON CONFLICT DO NOTHING;