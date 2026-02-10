-- =====================================================
-- Character Linking Migration (Deprecated)
-- =====================================================
-- This migration was replaced with automatic relationship detection
-- based on user_id and is_main fields.
-- No database changes are needed - relationships are computed at runtime.
--
-- Main/Alt relationships are now automatic:
-- - Characters with the same user_id are grouped together
-- - The character with is_main=true is the main character
-- - All others are alts
--
-- This file is kept for migration history but makes no changes.

-- Record this migration as applied
INSERT INTO migration_history (filename) VALUES ('019_character_linking.sql');
