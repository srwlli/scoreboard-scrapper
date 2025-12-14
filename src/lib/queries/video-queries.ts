/**
 * Video Queries for Supabase
 * Workorder: WO-VIDEO-LINKS-001
 */

import { createClient } from '@/lib/supabase/server'
import type { GameVideo } from '@/types/game'

export interface InsertGameVideo {
  game_id: string
  video_type?: 'highlights' | 'condensed_game' | 'full_game' | 'key_plays'
  youtube_id: string
  title: string
  thumbnail_url?: string | null
  duration?: string | null
  channel_title?: string | null
  published_at?: string | null
}

/**
 * Get all videos for a game
 */
export async function getGameVideos(gameId: string): Promise<GameVideo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .select('*')
    .eq('game_id', gameId)
    .order('video_type')

  if (error) {
    console.error('Error fetching game videos:', error)
    return []
  }

  return (data || []) as GameVideo[]
}

/**
 * Get a specific video by game ID and type
 */
export async function getGameVideoByType(
  gameId: string,
  videoType: GameVideo['video_type']
): Promise<GameVideo | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .select('*')
    .eq('game_id', gameId)
    .eq('video_type', videoType)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') { // Not found is expected
      console.error('Error fetching game video:', error)
    }
    return null
  }

  return data as GameVideo
}

/**
 * Check if a video already exists for a game
 */
export async function hasGameVideo(
  gameId: string,
  videoType: GameVideo['video_type'] = 'highlights'
): Promise<boolean> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('game_videos')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('video_type', videoType)

  if (error) {
    console.error('Error checking game video:', error)
    return false
  }

  return (count || 0) > 0
}

/**
 * Insert a new game video
 */
export async function insertGameVideo(video: InsertGameVideo): Promise<GameVideo | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .insert({
      game_id: video.game_id,
      video_type: video.video_type || 'highlights',
      youtube_id: video.youtube_id,
      title: video.title,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      channel_title: video.channel_title,
      published_at: video.published_at,
      scraped_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    // Check for duplicate youtube_id (unique constraint)
    if (error.code === '23505') {
      console.log(`Video already exists: ${video.youtube_id}`)
      return null
    }
    console.error('Error inserting game video:', error)
    return null
  }

  return data as GameVideo
}

/**
 * Update an existing game video
 */
export async function updateGameVideo(
  id: string,
  updates: Partial<InsertGameVideo>
): Promise<GameVideo | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('game_videos')
    .update({
      ...updates,
      scraped_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating game video:', error)
    return null
  }

  return data as GameVideo
}

/**
 * Delete a game video
 */
export async function deleteGameVideo(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('game_videos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting game video:', error)
    return false
  }

  return true
}

/**
 * Get games without videos (for batch scraping)
 */
export async function getGamesWithoutVideos(
  season: number,
  weekStart?: number,
  weekEnd?: number,
  limit: number = 100
): Promise<{ game_id: string; away_team_id: string; home_team_id: string; week: number; season: number }[]> {
  const supabase = await createClient()

  let query = supabase
    .from('games')
    .select('game_id, away_team_id, home_team_id, week, season')
    .eq('season', season)
    .eq('status', 'final') // Only completed games

  if (weekStart !== undefined) {
    query = query.gte('week', weekStart)
  }
  if (weekEnd !== undefined) {
    query = query.lte('week', weekEnd)
  }

  const { data: games, error: gamesError } = await query
    .order('week', { ascending: true })
    .limit(limit)

  if (gamesError || !games) {
    console.error('Error fetching games:', gamesError)
    return []
  }

  // Get game IDs that already have videos
  const { data: existingVideos, error: videosError } = await supabase
    .from('game_videos')
    .select('game_id')
    .eq('video_type', 'highlights')

  if (videosError) {
    console.error('Error fetching existing videos:', videosError)
    return []
  }

  const gamesWithVideos = new Set((existingVideos || []).map(v => v.game_id))

  // Filter out games that already have videos
  return games.filter(g => !gamesWithVideos.has(g.game_id))
}

/**
 * Get video scraping stats
 */
export async function getVideoScrapingStats(season: number): Promise<{
  totalGames: number
  gamesWithVideos: number
  coverage: number
}> {
  const supabase = await createClient()

  // Count total completed games
  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('season', season)
    .eq('status', 'final')

  // Count games with videos
  const { data: videoCounts } = await supabase
    .from('game_videos')
    .select('game_id')
    .eq('video_type', 'highlights')

  // Get unique game IDs from videos
  const uniqueGameIds = new Set((videoCounts || []).map(v => v.game_id))

  const gamesWithVideos = uniqueGameIds.size
  const total = totalGames || 0

  return {
    totalGames: total,
    gamesWithVideos,
    coverage: total > 0 ? Math.round((gamesWithVideos / total) * 100) : 0
  }
}
