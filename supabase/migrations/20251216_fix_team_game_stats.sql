-- Fix: Add missing team_game_stats columns
-- These were supposed to be added in 20251214_historical_backfill_schema.sql but didn't apply

ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_completions INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_attempts INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_pass DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_rush DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS interceptions_thrown INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS fumbles_lost INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sacks_allowed INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sack_yards_lost INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_drives INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_plays INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_play DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS defensive_tds INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS passes_defended INTEGER;
