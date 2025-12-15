-- Add sacks_allowed column that was missing from previous migration
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sacks_allowed INTEGER;
