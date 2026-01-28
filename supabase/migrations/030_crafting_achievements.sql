-- =====================================================
-- 028_crafting_achievements.sql - Crafting & Gathering Achievements
-- Add achievements for profession mastery across the guild
-- =====================================================

-- Insert new crafting and gathering achievements
INSERT INTO achievement_definitions (name, description, category, icon, requirement_type, requirement_value, points, sort_order) VALUES
  -- Gathering mastery
  ('Gatherers Guild', 'Have Journeyman+ in all gathering skills', 'economy', '🪓', 'gathering_journeyman_all', 1, 25, 40),
  ('Master Gatherers', 'Have Master+ in all gathering skills', 'economy', '⛏️', 'gathering_master_all', 1, 50, 41),
  ('Gathering Legends', 'Have Grandmaster in all gathering skills', 'economy', '🌟', 'gathering_grandmaster_all', 1, 100, 42),
  
  -- Processing mastery
  ('Processors United', 'Have Journeyman+ in all processing skills', 'economy', '⚙️', 'processing_journeyman_all', 1, 25, 43),
  ('Master Processors', 'Have Master+ in all processing skills', 'economy', '⚙️', 'processing_master_all', 1, 50, 44),
  ('Processing Mastery', 'Have Grandmaster in all processing skills', 'economy', '🔧', 'processing_grandmaster_all', 1, 100, 45),
  
  -- Crafting mastery
  ('Crafters United', 'Have Journeyman+ in all crafting skills', 'economy', '🔨', 'crafting_journeyman_all', 1, 25, 46),
  ('Master Crafters', 'Have Master+ in all crafting skills', 'economy', '🔨', 'crafting_master_all', 1, 50, 47),
  ('Ultimate Craftsmanship', 'Have Grandmaster in all crafting skills', 'economy', '👑', 'crafting_grandmaster_all', 1, 100, 48),
  
  -- Special milestones
  ('Jack of All Trades', 'Have Grandmaster in at least one skill from each tier', 'economy', '🎓', 'jack_of_all_trades', 1, 75, 49),
  ('Master of All Trades', 'Have Master+ in at least 3 skills from each tier', 'economy', '📚', 'master_of_all_trades', 1, 90, 50)
ON CONFLICT DO NOTHING;
