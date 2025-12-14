-- Migration: Add game_videos table
-- Workorder: WO-VIDEO-LINKS-001
-- Description: Store YouTube video metadata for game highlights

CREATE TABLE IF NOT EXISTS game_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  video_type TEXT NOT NULL DEFAULT 'highlights',
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,  -- ISO 8601 duration (e.g., "PT10M30S")
  channel_title TEXT,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_video_type CHECK (video_type IN ('highlights', 'condensed_game', 'full_game', 'key_plays'))
);

-- Index for fast lookups by game_id
CREATE INDEX IF NOT EXISTS idx_game_videos_game_id ON game_videos(game_id);

-- Index for finding videos by type
CREATE INDEX IF NOT EXISTS idx_game_videos_type ON game_videos(video_type);

-- Enable Row Level Security
ALTER TABLE game_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on game_videos"
  ON game_videos
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Allow service role full access on game_videos"
  ON game_videos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE game_videos IS 'YouTube video metadata for NFL game highlights';
COMMENT ON COLUMN game_videos.game_id IS 'ESPN game ID (e.g., espn-401772510)';
COMMENT ON COLUMN game_videos.video_type IS 'Type of video: highlights, condensed_game, full_game, key_plays';
COMMENT ON COLUMN game_videos.youtube_id IS 'YouTube video ID (11 characters)';
COMMENT ON COLUMN game_videos.duration IS 'Video duration in ISO 8601 format';
