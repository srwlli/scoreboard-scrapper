/**
 * YouTube Data API v3 Client
 * Workorder: WO-VIDEO-LINKS-001
 *
 * NFL YouTube Channel ID: UCDVYQ4Zhbm3S2dlz7P1GBDg
 * Video Title Pattern: "{AwayNickname} vs. {HomeNickname} highlights | Week {N}"
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const NFL_CHANNEL_ID = 'UCDVYQ4Zhbm3S2dlz7P1GBDg'
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'

/**
 * Team name to nickname mapping
 * NFL video titles use nicknames only (e.g., "Texans" not "Houston Texans")
 */
export const TEAM_NICKNAMES: Record<string, string> = {
  // AFC East
  BUF: 'Bills',
  MIA: 'Dolphins',
  NE: 'Patriots',
  NYJ: 'Jets',
  // AFC North
  BAL: 'Ravens',
  CIN: 'Bengals',
  CLE: 'Browns',
  PIT: 'Steelers',
  // AFC South
  HOU: 'Texans',
  IND: 'Colts',
  JAX: 'Jaguars',
  TEN: 'Titans',
  // AFC West
  DEN: 'Broncos',
  KC: 'Chiefs',
  LV: 'Raiders',
  LAC: 'Chargers',
  // NFC East
  DAL: 'Cowboys',
  NYG: 'Giants',
  PHI: 'Eagles',
  WAS: 'Commanders',
  // NFC North
  CHI: 'Bears',
  DET: 'Lions',
  GB: 'Packers',
  MIN: 'Vikings',
  // NFC South
  ATL: 'Falcons',
  CAR: 'Panthers',
  NO: 'Saints',
  TB: 'Buccaneers',
  // NFC West
  ARI: 'Cardinals',
  LA: 'Rams',
  LAR: 'Rams',
  SF: '49ers',
  SEA: 'Seahawks'
}

export interface YouTubeSearchResult {
  youtube_id: string
  title: string
  thumbnail_url: string
  channel_title: string
  published_at: string
}

export interface YouTubeVideoDetails extends YouTubeSearchResult {
  duration: string // ISO 8601 format (e.g., "PT10M30S")
}

/**
 * Build search query for NFL game highlights
 * Format: "{AwayNickname} vs. {HomeNickname} highlights Week {N}"
 */
export function buildSearchQuery(
  awayTeamId: string,
  homeTeamId: string,
  week: number
): string {
  const awayNickname = TEAM_NICKNAMES[awayTeamId] || awayTeamId
  const homeNickname = TEAM_NICKNAMES[homeTeamId] || homeTeamId
  return `${awayNickname} vs. ${homeNickname} highlights Week ${week}`
}

/**
 * Search for NFL game highlight video on YouTube
 * Uses YouTube Data API v3 search.list endpoint
 * Cost: 100 quota units per call
 */
export async function searchGameHighlight(
  awayTeamId: string,
  homeTeamId: string,
  week: number,
  season: number
): Promise<YouTubeSearchResult | null> {
  if (!YOUTUBE_API_KEY) {
    console.error('YOUTUBE_API_KEY not configured')
    return null
  }

  const query = buildSearchQuery(awayTeamId, homeTeamId, week)

  const params = new URLSearchParams({
    key: YOUTUBE_API_KEY,
    channelId: NFL_CHANNEL_ID,
    q: query,
    type: 'video',
    part: 'snippet',
    maxResults: '5',
    order: 'relevance'
  })

  try {
    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`)

    if (!response.ok) {
      const error = await response.json()
      console.error('YouTube API error:', error)
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.log(`No video found for: ${query}`)
      return null
    }

    // Find the best match - prioritize exact title pattern match
    const targetPattern = new RegExp(
      `${TEAM_NICKNAMES[awayTeamId] || awayTeamId}.*vs.*${TEAM_NICKNAMES[homeTeamId] || homeTeamId}.*highlights.*Week\\s*${week}`,
      'i'
    )

    // Also match reverse order (home vs away - some videos use this)
    const reversePattern = new RegExp(
      `${TEAM_NICKNAMES[homeTeamId] || homeTeamId}.*vs.*${TEAM_NICKNAMES[awayTeamId] || awayTeamId}.*highlights.*Week\\s*${week}`,
      'i'
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bestMatch = data.items.find((item: any) =>
      targetPattern.test(item.snippet.title) || reversePattern.test(item.snippet.title)
    )

    // If no exact match, use the first result
    if (!bestMatch) {
      bestMatch = data.items[0]
    }

    return {
      youtube_id: bestMatch.id.videoId,
      title: bestMatch.snippet.title,
      thumbnail_url: bestMatch.snippet.thumbnails?.high?.url ||
                     bestMatch.snippet.thumbnails?.medium?.url ||
                     bestMatch.snippet.thumbnails?.default?.url,
      channel_title: bestMatch.snippet.channelTitle,
      published_at: bestMatch.snippet.publishedAt
    }
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return null
  }
}

/**
 * Get video duration using videos.list endpoint
 * Cost: 1 quota unit per call
 */
export async function getVideoDuration(youtubeId: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    return null
  }

  const params = new URLSearchParams({
    key: YOUTUBE_API_KEY,
    id: youtubeId,
    part: 'contentDetails'
  })

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    return data.items[0].contentDetails.duration
  } catch {
    return null
  }
}

/**
 * Search for game highlight and get full details including duration
 * Total cost: 101 quota units (100 for search + 1 for video details)
 */
export async function searchGameHighlightWithDetails(
  awayTeamId: string,
  homeTeamId: string,
  week: number,
  season: number
): Promise<YouTubeVideoDetails | null> {
  const searchResult = await searchGameHighlight(awayTeamId, homeTeamId, week, season)

  if (!searchResult) {
    return null
  }

  const duration = await getVideoDuration(searchResult.youtube_id)

  return {
    ...searchResult,
    duration: duration || 'PT0S'
  }
}

/**
 * Format ISO 8601 duration to human-readable string
 * e.g., "PT10M30S" -> "10:30"
 */
export function formatDuration(isoDuration: string | null): string {
  if (!isoDuration) return ''

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get YouTube embed URL for a video
 * Uses youtube-nocookie.com for privacy-enhanced mode (better embedding compatibility)
 */
export function getEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`
}

/**
 * Get YouTube watch URL for a video
 */
export function getWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`
}

/**
 * Get high-quality thumbnail URL for a YouTube video
 */
export function getThumbnailUrl(youtubeId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  }
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`
}
