-- Migration: Historical Backfill Schema Enhancements
-- Workorder: WO-HISTORICAL-BACKFILL-001
-- Description: Add new columns to support complete ESPN and nflverse data capture
-- See: coderef/working/historical-backfill/BACKFILL-PLAN.md

-- ============================================================================
-- TEAM_GAME_STATS - Add 13 new columns from ESPN boxscore
-- ============================================================================

-- Passing details
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_completions INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_attempts INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_pass DECIMAL(4,2);

-- Rushing details
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_rush DECIMAL(4,2);

-- Turnover breakdown
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS interceptions_thrown INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS fumbles_lost INTEGER;

-- Sack details (more granular than existing sacks_allowed)
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sack_yards_lost INTEGER;

-- Play totals
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_drives INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_plays INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_play DECIMAL(4,2);

-- Defensive stats
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS defensive_tds INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS passes_defended INTEGER;

COMMENT ON COLUMN team_game_stats.pass_completions IS 'Passing completions (from ESPN completionAttempts)';
COMMENT ON COLUMN team_game_stats.pass_attempts IS 'Passing attempts (from ESPN completionAttempts)';
COMMENT ON COLUMN team_game_stats.yards_per_pass IS 'Yards per pass attempt';
COMMENT ON COLUMN team_game_stats.yards_per_rush IS 'Yards per rush attempt';
COMMENT ON COLUMN team_game_stats.interceptions_thrown IS 'Interceptions thrown by offense';
COMMENT ON COLUMN team_game_stats.fumbles_lost IS 'Fumbles lost by offense';
COMMENT ON COLUMN team_game_stats.sack_yards_lost IS 'Yards lost from sacks';
COMMENT ON COLUMN team_game_stats.total_drives IS 'Total offensive drives';
COMMENT ON COLUMN team_game_stats.total_plays IS 'Total offensive plays';
COMMENT ON COLUMN team_game_stats.yards_per_play IS 'Yards per offensive play';
COMMENT ON COLUMN team_game_stats.defensive_tds IS 'Defensive touchdowns scored';
COMMENT ON COLUMN team_game_stats.passes_defended IS 'Passes defended by defense';

-- ============================================================================
-- LIVE_PLAYS - Add 20+ new columns from ESPN and nflverse PBP
-- ============================================================================

-- ESPN fields
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS participant_ids JSONB;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS end_yard_line INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS expected_points DECIMAL(5,2);

-- nflverse EPA analytics (enhance existing epa column)
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS wpa DECIMAL(6,4);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS success BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS air_epa DECIMAL(6,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS yac_epa DECIMAL(6,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS cp DECIMAL(4,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS cpoe DECIMAL(5,2);

-- Player attribution (from nflverse)
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS passer_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS passer_player_name TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS receiver_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS receiver_player_name TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS rusher_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS rusher_player_name TEXT;

-- Pass details (from nflverse)
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS air_yards INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS yards_after_catch INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS pass_length TEXT;  -- 'short' or 'deep'
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS pass_location TEXT;  -- 'left', 'middle', 'right'

-- Situation context (from nflverse)
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS shotgun BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS no_huddle BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS score_differential INTEGER;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_live_plays_passer ON live_plays(passer_player_id) WHERE passer_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_plays_receiver ON live_plays(receiver_player_id) WHERE receiver_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_plays_rusher ON live_plays(rusher_player_id) WHERE rusher_player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_plays_epa ON live_plays(epa) WHERE epa IS NOT NULL;

COMMENT ON COLUMN live_plays.participant_ids IS 'JSON array of player IDs involved in play (from ESPN)';
COMMENT ON COLUMN live_plays.end_yard_line IS 'Ending yard line position';
COMMENT ON COLUMN live_plays.expected_points IS 'Expected points at play start (from ESPN)';
COMMENT ON COLUMN live_plays.wpa IS 'Win probability added (from nflverse)';
COMMENT ON COLUMN live_plays.success IS 'Successful play (EPA > 0)';
COMMENT ON COLUMN live_plays.air_epa IS 'EPA from air yards (pass plays)';
COMMENT ON COLUMN live_plays.yac_epa IS 'EPA from yards after catch';
COMMENT ON COLUMN live_plays.cp IS 'Completion probability (0-1)';
COMMENT ON COLUMN live_plays.cpoe IS 'Completion percentage over expected';
COMMENT ON COLUMN live_plays.passer_player_id IS 'QB player ID (nflverse format)';
COMMENT ON COLUMN live_plays.passer_player_name IS 'QB name';
COMMENT ON COLUMN live_plays.receiver_player_id IS 'Receiver player ID';
COMMENT ON COLUMN live_plays.receiver_player_name IS 'Receiver name';
COMMENT ON COLUMN live_plays.rusher_player_id IS 'Ball carrier player ID';
COMMENT ON COLUMN live_plays.rusher_player_name IS 'Ball carrier name';
COMMENT ON COLUMN live_plays.air_yards IS 'Depth of target (pass plays)';
COMMENT ON COLUMN live_plays.yards_after_catch IS 'YAC on completed passes';
COMMENT ON COLUMN live_plays.pass_length IS 'Short (<15 yds) or Deep (15+ yds)';
COMMENT ON COLUMN live_plays.pass_location IS 'Left, Middle, or Right';
COMMENT ON COLUMN live_plays.shotgun IS 'Shotgun formation';
COMMENT ON COLUMN live_plays.no_huddle IS 'No-huddle offense';
COMMENT ON COLUMN live_plays.score_differential IS 'Score margin at time of play';

-- ============================================================================
-- LIVE_DRIVES - Add 5 new columns for drive analytics
-- ============================================================================

ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS espn_drive_id TEXT;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS penalty_count INTEGER;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS first_downs INTEGER;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS is_red_zone BOOLEAN;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS yards_penalized INTEGER;

COMMENT ON COLUMN live_drives.espn_drive_id IS 'ESPN internal drive ID';
COMMENT ON COLUMN live_drives.penalty_count IS 'Number of penalties during drive';
COMMENT ON COLUMN live_drives.first_downs IS 'First downs gained during drive';
COMMENT ON COLUMN live_drives.is_red_zone IS 'Drive reached red zone (inside 20)';
COMMENT ON COLUMN live_drives.yards_penalized IS 'Penalty yards during drive';
