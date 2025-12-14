/**
 * Video API Route
 * Workorder: WO-VIDEO-LINKS-001
 *
 * GET /api/videos/[gameId] - Get video(s) for a game
 *
 * Strategy: Cache-first
 * 1. Check database for existing video
 * 2. If found, return cached data
 * 3. If not found, search YouTube API and cache result
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGameVideos, insertGameVideo, hasGameVideo } from '@/lib/queries/video-queries'
import { searchGameHighlightWithDetails } from '@/lib/youtube'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId: rawGameId } = await params

  // Normalize game ID to ESPN format
  const gameId = rawGameId.startsWith('espn-') ? rawGameId : `espn-${rawGameId}`

  try {
    // 1. Check cache first
    const cachedVideos = await getGameVideos(gameId)

    if (cachedVideos.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        videos: cachedVideos
      })
    }

    // 2. Get game info to build search query
    const supabase = await createClient()
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('game_id, season, week, home_team_id, away_team_id, status')
      .eq('game_id', gameId)
      .single()

    if (gameError || !game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // 3. Only search for completed games
    if (game.status !== 'final') {
      return NextResponse.json({
        success: true,
        source: 'skip',
        reason: 'Game not completed',
        videos: []
      })
    }

    // 4. Check if we should search YouTube (to avoid redundant API calls)
    const alreadySearched = await hasGameVideo(gameId, 'highlights')
    if (alreadySearched) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        videos: []
      })
    }

    // 5. Search YouTube for highlights
    const videoResult = await searchGameHighlightWithDetails(
      game.away_team_id,
      game.home_team_id,
      game.week,
      game.season
    )

    if (!videoResult) {
      return NextResponse.json({
        success: true,
        source: 'youtube',
        reason: 'No video found on YouTube',
        videos: []
      })
    }

    // 6. Cache the result
    const savedVideo = await insertGameVideo({
      game_id: gameId,
      video_type: 'highlights',
      youtube_id: videoResult.youtube_id,
      title: videoResult.title,
      thumbnail_url: videoResult.thumbnail_url,
      duration: videoResult.duration,
      channel_title: videoResult.channel_title,
      published_at: videoResult.published_at
    })

    return NextResponse.json({
      success: true,
      source: 'youtube',
      videos: savedVideo ? [savedVideo] : []
    })
  } catch (error) {
    console.error('Error in videos API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
