-- Migration: Play-by-Play Analytics Schema Enhancements
-- Workorder: WO-HISTORICAL-BACKFILL-001
-- Description: Add nflverse analytics columns to play_by_play table
-- See: coderef/working/historical-backfill/BACKFILL-PLAN.md

-- ============================================================================
-- PLAY_BY_PLAY - Add nflverse analytics columns
-- ============================================================================

-- EPA breakdown
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS air_epa DECIMAL(6,3);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS yac_epa DECIMAL(6,3);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS comp_air_epa DECIMAL(6,3);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS comp_yac_epa DECIMAL(6,3);

-- Win probability context
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS home_wp DECIMAL(5,4);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS away_wp DECIMAL(5,4);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS vegas_home_wp DECIMAL(5,4);

-- Completion probability (nflverse xPass model)
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS cp DECIMAL(4,3);
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS cpoe DECIMAL(5,2);

-- Player attribution - Passer
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS passer_player_id TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS passer_player_name TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS passer_jersey_number INTEGER;

-- Player attribution - Receiver
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS receiver_player_id TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS receiver_player_name TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS receiver_jersey_number INTEGER;

-- Player attribution - Rusher
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS rusher_player_id TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS rusher_player_name TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS rusher_jersey_number INTEGER;

-- Pass details
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS air_yards INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS yards_after_catch INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS pass_length TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS pass_location TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS qb_hit BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS sack BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS interception BOOLEAN;

-- Rush details
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS run_location TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS run_gap TEXT;

-- Situation context
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS shotgun BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS no_huddle BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS qb_dropback BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS qb_scramble BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS score_differential INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS half_seconds_remaining INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS game_seconds_remaining INTEGER;

-- Scoring flags
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS touchdown BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS pass_touchdown BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS rush_touchdown BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS return_touchdown BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS extra_point_result TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS two_point_conv_result TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS field_goal_result TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS kick_distance INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS safety BOOLEAN;

-- Penalty info
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS penalty BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS penalty_team TEXT;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS penalty_yards INTEGER;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS penalty_type TEXT;

-- Down conversion tracking
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS punt_blocked BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS first_down_rush BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS first_down_pass BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS first_down_penalty BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS third_down_converted BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS third_down_failed BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS fourth_down_converted BOOLEAN;
ALTER TABLE play_by_play ADD COLUMN IF NOT EXISTS fourth_down_failed BOOLEAN;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_play_by_play_passer ON play_by_play(passer_player_id) WHERE passer_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_by_play_receiver ON play_by_play(receiver_player_id) WHERE receiver_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_by_play_rusher ON play_by_play(rusher_player_id) WHERE rusher_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_by_play_epa ON play_by_play(epa) WHERE epa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_by_play_cpoe ON play_by_play(cpoe) WHERE cpoe IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_by_play_game_season ON play_by_play(game_id, season);

-- Comments
COMMENT ON COLUMN play_by_play.air_epa IS 'EPA from air yards (pass plays)';
COMMENT ON COLUMN play_by_play.yac_epa IS 'EPA from yards after catch';
COMMENT ON COLUMN play_by_play.comp_air_epa IS 'Completed pass air EPA';
COMMENT ON COLUMN play_by_play.comp_yac_epa IS 'Completed pass YAC EPA';
COMMENT ON COLUMN play_by_play.home_wp IS 'Home team win probability';
COMMENT ON COLUMN play_by_play.away_wp IS 'Away team win probability';
COMMENT ON COLUMN play_by_play.vegas_home_wp IS 'Vegas-adjusted home win probability';
COMMENT ON COLUMN play_by_play.cp IS 'Completion probability (0-1)';
COMMENT ON COLUMN play_by_play.cpoe IS 'Completion percentage over expected';
COMMENT ON COLUMN play_by_play.passer_player_id IS 'QB player ID (nflverse format)';
COMMENT ON COLUMN play_by_play.passer_player_name IS 'QB name';
COMMENT ON COLUMN play_by_play.receiver_player_id IS 'Receiver player ID';
COMMENT ON COLUMN play_by_play.receiver_player_name IS 'Receiver name';
COMMENT ON COLUMN play_by_play.rusher_player_id IS 'Ball carrier player ID';
COMMENT ON COLUMN play_by_play.rusher_player_name IS 'Ball carrier name';
COMMENT ON COLUMN play_by_play.air_yards IS 'Depth of target (pass plays)';
COMMENT ON COLUMN play_by_play.yards_after_catch IS 'YAC on completed passes';
COMMENT ON COLUMN play_by_play.pass_length IS 'Short (<15 yds) or Deep (15+ yds)';
COMMENT ON COLUMN play_by_play.pass_location IS 'Left, Middle, or Right';
COMMENT ON COLUMN play_by_play.run_location IS 'Rush direction: Left, Middle, Right';
COMMENT ON COLUMN play_by_play.run_gap IS 'Rush gap: Guard, Tackle, End';
COMMENT ON COLUMN play_by_play.shotgun IS 'Shotgun formation';
COMMENT ON COLUMN play_by_play.no_huddle IS 'No-huddle offense';
COMMENT ON COLUMN play_by_play.qb_dropback IS 'QB dropback play';
COMMENT ON COLUMN play_by_play.qb_scramble IS 'QB scramble';
COMMENT ON COLUMN play_by_play.score_differential IS 'Score margin at time of play';
