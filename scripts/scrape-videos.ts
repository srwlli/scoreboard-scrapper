/**
 * Batch Video Scraper
 * Workorder: WO-VIDEO-LINKS-001
 *
 * Scrapes YouTube for NFL game videos (highlights or full games) and caches them in the database.
 *
 * Usage:
 *   npx tsx scripts/scrape-videos.ts --season 2024
 *   npx tsx scripts/scrape-videos.ts --season 2024 --type full_game
 *   npx tsx scripts/scrape-videos.ts --season 2024 --week-start 1 --week-end 5
 *   npx tsx scripts/scrape-videos.ts --season 2024 --limit 10 --dry-run
 *
 * Options:
 *   --season       Required. NFL season year (e.g., 2024)
 *   --type         Optional. Video type: "highlights" (default) or "full_game"
 *   --week-start   Optional. Starting week (1-18)
 *   --week-end     Optional. Ending week (1-18)
 *   --limit        Optional. Max games to process (default: 100)
 *   --dry-run      Optional. Preview without making API calls
 *   --delay        Optional. Delay between API calls in ms (default: 1000)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const NFL_CHANNEL_ID = 'UCDVYQ4Zhbm3S2dlz7P1GBDg'
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Team nickname mapping
const TEAM_NICKNAMES: Record<string, string> = {
  BUF: 'Bills', MIA: 'Dolphins', NE: 'Patriots', NYJ: 'Jets',
  BAL: 'Ravens', CIN: 'Bengals', CLE: 'Browns', PIT: 'Steelers',
  HOU: 'Texans', IND: 'Colts', JAX: 'Jaguars', TEN: 'Titans',
  DEN: 'Broncos', KC: 'Chiefs', LV: 'Raiders', LAC: 'Chargers',
  DAL: 'Cowboys', NYG: 'Giants', PHI: 'Eagles', WAS: 'Commanders',
  CHI: 'Bears', DET: 'Lions', GB: 'Packers', MIN: 'Vikings',
  ATL: 'Falcons', CAR: 'Panthers', NO: 'Saints', TB: 'Buccaneers',
  ARI: 'Cardinals', LA: 'Rams', LAR: 'Rams', SF: '49ers', SEA: 'Seahawks'
}

interface Game {
  game_id: string
  away_team_id: string
  home_team_id: string
  week: number
  season: number
}

interface ScrapingResult {
  game_id: string
  success: boolean
  youtube_id?: string
  title?: string
  error?: string
}

// Parse command line arguments
function parseArgs(): {
  season: number
  weekStart?: number
  weekEnd?: number
  limit: number
  dryRun: boolean
  delay: number
  videoType: 'highlights' | 'full_game'
} {
  const args = process.argv.slice(2)
  const result = {
    season: 0,
    weekStart: undefined as number | undefined,
    weekEnd: undefined as number | undefined,
    limit: 100,
    dryRun: false,
    delay: 1000,
    videoType: 'highlights' as 'highlights' | 'full_game'
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--season':
        result.season = parseInt(args[++i], 10)
        break
      case '--week-start':
        result.weekStart = parseInt(args[++i], 10)
        break
      case '--week-end':
        result.weekEnd = parseInt(args[++i], 10)
        break
      case '--limit':
        result.limit = parseInt(args[++i], 10)
        break
      case '--dry-run':
        result.dryRun = true
        break
      case '--delay':
        result.delay = parseInt(args[++i], 10)
        break
      case '--type':
        const type = args[++i]
        if (type === 'highlights' || type === 'full_game') {
          result.videoType = type
        } else {
          console.error('Error: --type must be "highlights" or "full_game"')
          process.exit(1)
        }
        break
    }
  }

  if (!result.season) {
    console.error('Error: --season is required')
    console.error('Usage: npx tsx scripts/scrape-videos.ts --season 2024')
    console.error('       npx tsx scripts/scrape-videos.ts --season 2024 --type full_game')
    process.exit(1)
  }

  return result
}

// Build search query
function buildSearchQuery(awayTeamId: string, homeTeamId: string, week: number, videoType: 'highlights' | 'full_game'): string {
  const awayNickname = TEAM_NICKNAMES[awayTeamId] || awayTeamId
  const homeNickname = TEAM_NICKNAMES[homeTeamId] || homeTeamId

  if (videoType === 'full_game') {
    // NFL posts full games with titles like "Team vs Team FULL GAME Week N"
    return `${awayNickname} vs. ${homeNickname} FULL GAME Week ${week}`
  }

  return `${awayNickname} vs. ${homeNickname} highlights Week ${week}`
}

// Search YouTube for a game
async function searchYouTube(query: string): Promise<{
  youtube_id: string
  title: string
  thumbnail_url: string
  channel_title: string
  published_at: string
} | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY not configured')
  }

  const params = new URLSearchParams({
    key: YOUTUBE_API_KEY,
    channelId: NFL_CHANNEL_ID,
    q: query,
    type: 'video',
    part: 'snippet',
    maxResults: '5',
    order: 'relevance'
  })

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`YouTube API error: ${JSON.stringify(error)}`)
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    return null
  }

  // Return first result
  const item = data.items[0]
  return {
    youtube_id: item.id.videoId,
    title: item.snippet.title,
    thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    channel_title: item.snippet.channelTitle,
    published_at: item.snippet.publishedAt
  }
}

// Get video duration
async function getVideoDuration(youtubeId: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null

  const params = new URLSearchParams({
    key: YOUTUBE_API_KEY,
    id: youtubeId,
    part: 'contentDetails'
  })

  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)

  if (!response.ok) return null

  const data = await response.json()

  if (!data.items || data.items.length === 0) return null

  return data.items[0].contentDetails.duration
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Main scraper function
async function main() {
  const { season, weekStart, weekEnd, limit, dryRun, delay, videoType } = parseArgs()

  console.log('='.repeat(60))
  console.log('NFL Video Scraper - WO-VIDEO-LINKS-001')
  console.log('='.repeat(60))
  console.log(`Season: ${season}`)
  console.log(`Video Type: ${videoType}`)
  console.log(`Week Range: ${weekStart || 1} - ${weekEnd || 18}`)
  console.log(`Limit: ${limit}`)
  console.log(`Dry Run: ${dryRun}`)
  console.log(`Delay: ${delay}ms`)
  console.log('='.repeat(60))

  if (!YOUTUBE_API_KEY && !dryRun) {
    console.error('Error: YOUTUBE_API_KEY environment variable not set')
    process.exit(1)
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Supabase environment variables not set')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Get games without videos
  let query = supabase
    .from('games')
    .select('game_id, away_team_id, home_team_id, week, season')
    .eq('season', season)
    .eq('status', 'final')

  if (weekStart !== undefined) {
    query = query.gte('week', weekStart)
  }
  if (weekEnd !== undefined) {
    query = query.lte('week', weekEnd)
  }

  const { data: games, error: gamesError } = await query
    .order('week', { ascending: true })
    .limit(limit * 2) // Fetch extra to account for filtering

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    process.exit(1)
  }

  if (!games || games.length === 0) {
    console.log('No games found for the specified criteria')
    process.exit(0)
  }

  // Get existing videos of this type
  const { data: existingVideos } = await supabase
    .from('game_videos')
    .select('game_id')
    .eq('video_type', videoType)

  const gamesWithVideos = new Set((existingVideos || []).map(v => v.game_id))

  // Filter games without videos
  const gamesToProcess = (games as Game[])
    .filter(g => !gamesWithVideos.has(g.game_id))
    .slice(0, limit)

  console.log(`\nFound ${games.length} total games, ${gamesToProcess.length} without videos`)
  console.log(`Processing ${gamesToProcess.length} games...\n`)

  const results: ScrapingResult[] = []
  let successCount = 0
  let failCount = 0
  let quotaUsed = 0

  for (let i = 0; i < gamesToProcess.length; i++) {
    const game = gamesToProcess[i]
    const query = buildSearchQuery(game.away_team_id, game.home_team_id, game.week, videoType)

    console.log(`[${i + 1}/${gamesToProcess.length}] Week ${game.week} (${videoType}): ${query}`)

    if (dryRun) {
      console.log(`  [DRY RUN] Would search YouTube for: ${query}`)
      results.push({ game_id: game.game_id, success: true })
      successCount++
      continue
    }

    try {
      // Search YouTube (100 quota units)
      const videoResult = await searchYouTube(query)
      quotaUsed += 100

      if (!videoResult) {
        console.log('  ❌ No video found')
        results.push({ game_id: game.game_id, success: false, error: 'No video found' })
        failCount++
        await sleep(delay)
        continue
      }

      // Get duration (1 quota unit)
      const duration = await getVideoDuration(videoResult.youtube_id)
      quotaUsed += 1

      // Insert into database
      const { error: insertError } = await supabase
        .from('game_videos')
        .insert({
          game_id: game.game_id,
          video_type: videoType,
          youtube_id: videoResult.youtube_id,
          title: videoResult.title,
          thumbnail_url: videoResult.thumbnail_url,
          duration: duration,
          channel_title: videoResult.channel_title,
          published_at: videoResult.published_at,
          scraped_at: new Date().toISOString()
        })

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`  ⚠️ Video already exists: ${videoResult.youtube_id}`)
        } else {
          throw new Error(`DB insert failed: ${insertError.message} (code: ${insertError.code})`)
        }
      } else {
        console.log(`  ✅ ${videoResult.title}`)
        results.push({
          game_id: game.game_id,
          success: true,
          youtube_id: videoResult.youtube_id,
          title: videoResult.title
        })
        successCount++
      }

      // Rate limiting
      await sleep(delay)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error)
      console.log(`  ❌ Error: ${errorMsg}`)
      results.push({
        game_id: game.game_id,
        success: false,
        error: errorMsg
      })
      failCount++
      await sleep(delay)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total processed: ${gamesToProcess.length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Quota used: ~${quotaUsed} units`)
  console.log(`Quota remaining: ~${10000 - quotaUsed} units (estimated)`)
  console.log('='.repeat(60))
}

main().catch(console.error)
