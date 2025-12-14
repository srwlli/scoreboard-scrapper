/**
 * Create game_videos table directly
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Try to query the table first to check if it exists
  const { error: checkError } = await supabase
    .from('game_videos')
    .select('id')
    .limit(1)

  if (!checkError) {
    console.log('✅ Table game_videos already exists!')
    return
  }

  console.log('Table does not exist, need to create via Supabase Dashboard SQL Editor')
  console.log('\nRun this SQL in Supabase Dashboard → SQL Editor:\n')
  console.log(`
CREATE TABLE IF NOT EXISTS game_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'highlights',
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  channel_title TEXT,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_videos_game_id ON game_videos(game_id);

ALTER TABLE game_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON game_videos FOR SELECT TO public USING (true);
CREATE POLICY "Allow anon insert" ON game_videos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update" ON game_videos FOR UPDATE TO anon USING (true);
  `)
}

main().catch(console.error)
