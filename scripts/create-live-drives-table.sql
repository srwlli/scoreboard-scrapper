-- Create live_drives table for ESPN drive result data
-- This stores drive-level data scraped from ESPN API
-- Avoids client-side computation of drive results

CREATE TABLE IF NOT EXISTS live_drives (
  id BIGSERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  drive_number INTEGER NOT NULL,

  -- Team info
  team_id VARCHAR(10),

  -- Drive result (from ESPN)
  result VARCHAR(20),           -- "FG", "TD", "PUNT", "INT", "FUMBLE", "DOWNS", "END OF HALF", etc.
  display_result VARCHAR(50),    -- "Field Goal", "Touchdown", "Punt", "Interception", etc.
  short_display_result VARCHAR(30),
  is_score BOOLEAN DEFAULT FALSE,

  -- Drive stats
  yards INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  description VARCHAR(100),      -- "15 plays, 67 yards, 6:43"
  time_elapsed VARCHAR(20),      -- "6:43"

  -- Start/end positions
  start_quarter INTEGER,
  start_clock VARCHAR(10),
  start_yard_line INTEGER,
  start_yard_line_text VARCHAR(20),

  end_quarter INTEGER,
  end_clock VARCHAR(10),
  end_yard_line INTEGER,
  end_yard_line_text VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(game_id, season, drive_number)
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_live_drives_game_id ON live_drives(game_id);
CREATE INDEX IF NOT EXISTS idx_live_drives_game_season ON live_drives(game_id, season);
CREATE INDEX IF NOT EXISTS idx_live_drives_team_id ON live_drives(team_id);
