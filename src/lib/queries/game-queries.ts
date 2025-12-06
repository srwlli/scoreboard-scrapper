import { createClient } from '@/lib/supabase/server'
import type {
  Game,
  Team,
  Stadium,
  GameWeather,
  TeamGameStats,
  PlayerGameStats,
  ScoringPlay,
  SnapCount,
  PlayByPlay,
  NGSPassing,
  NGSRushing,
  NGSReceiving,
  AdvancedStats,
  toNflverseGameId
} from '@/types/game'

export interface GameDetailData {
  game: Game
  homeTeam: Team
  awayTeam: Team
  stadium: Stadium | null
  weather: GameWeather | null
  homeTeamStats: TeamGameStats | null
  awayTeamStats: TeamGameStats | null
  playerStats: PlayerGameStats[]
  scoringPlays: ScoringPlay[]
  snapCounts: SnapCount[]
  playByPlay: PlayByPlay[]
  ngsPassing: NGSPassing[]
  ngsRushing: NGSRushing[]
  ngsReceiving: NGSReceiving[]
  advancedStats: AdvancedStats[]
}

/**
 * Fetches all data needed for the game detail page
 * Handles both ESPN format (espn-401772510) and nflverse format (2025_01_BAL_KC) game IDs
 */
export async function getGameDetails(gameId: string): Promise<GameDetailData | null> {
  const supabase = await createClient()

  // First, fetch the game to get the actual game_id and related IDs
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*),
      stadium:stadiums(*)
    `)
    .eq('game_id', gameId)
    .single()

  if (gameError || !game) {
    console.error('Error fetching game:', gameError)
    return null
  }

  const homeTeam = game.home_team as Team
  const awayTeam = game.away_team as Team
  const stadium = game.stadium as Stadium | null

  // Generate nflverse game ID for nflverse-specific tables
  const nflverseGameId = generateNflverseGameId(game as Game, homeTeam, awayTeam)

  // Fetch all related data in parallel
  const [
    weatherResult,
    homeStatsResult,
    awayStatsResult,
    playerStatsResult,
    scoringPlaysResult,
    snapCountsResult,
    playByPlayResult,
    ngsPassingResult,
    ngsRushingResult,
    ngsReceivingResult,
    advancedStatsResult
  ] = await Promise.all([
    // Weather
    supabase
      .from('game_weather')
      .select('*')
      .eq('game_id', gameId)
      .single(),

    // Home team stats
    supabase
      .from('team_game_stats')
      .select('*')
      .eq('game_id', gameId)
      .eq('team_id', homeTeam.team_id)
      .single(),

    // Away team stats
    supabase
      .from('team_game_stats')
      .select('*')
      .eq('game_id', gameId)
      .eq('team_id', awayTeam.team_id)
      .single(),

    // Player stats with player info
    supabase
      .from('player_game_stats')
      .select(`
        *,
        player:players(*)
      `)
      .eq('game_id', gameId),

    // Scoring plays
    supabase
      .from('scoring_plays')
      .select('*')
      .eq('game_id', gameId)
      .order('quarter')
      .order('time_remaining_seconds', { ascending: false }),

    // Snap counts (uses nflverse game_id)
    supabase
      .from('snap_counts')
      .select('*')
      .eq('game_id', nflverseGameId),

    // Play by play (uses nflverse game_id)
    supabase
      .from('play_by_play')
      .select('*')
      .eq('game_id', nflverseGameId)
      .order('quarter')
      .order('time_remaining_seconds', { ascending: false }),

    // NGS Passing (query by season/week, filter by teams in component)
    supabase
      .from('ngs_passing')
      .select('*')
      .eq('season', game.season)
      .eq('week', game.week),

    // NGS Rushing
    supabase
      .from('ngs_rushing')
      .select('*')
      .eq('season', game.season)
      .eq('week', game.week),

    // NGS Receiving
    supabase
      .from('ngs_receiving')
      .select('*')
      .eq('season', game.season)
      .eq('week', game.week),

    // Advanced stats
    supabase
      .from('player_stats_advanced')
      .select('*')
      .eq('season', game.season)
      .eq('week', game.week)
  ])

  return {
    game: game as Game,
    homeTeam,
    awayTeam,
    stadium,
    weather: weatherResult.data as GameWeather | null,
    homeTeamStats: homeStatsResult.data as TeamGameStats | null,
    awayTeamStats: awayStatsResult.data as TeamGameStats | null,
    playerStats: (playerStatsResult.data || []) as PlayerGameStats[],
    scoringPlays: (scoringPlaysResult.data || []) as ScoringPlay[],
    snapCounts: (snapCountsResult.data || []) as SnapCount[],
    playByPlay: (playByPlayResult.data || []) as PlayByPlay[],
    ngsPassing: (ngsPassingResult.data || []) as NGSPassing[],
    ngsRushing: (ngsRushingResult.data || []) as NGSRushing[],
    ngsReceiving: (ngsReceivingResult.data || []) as NGSReceiving[],
    advancedStats: (advancedStatsResult.data || []) as AdvancedStats[]
  }
}

/**
 * Generates nflverse format game ID from game data
 * Format: YYYY_WW_AWAY_HOME (e.g., 2024_01_BAL_KC)
 */
function generateNflverseGameId(game: Game, homeTeam: Team, awayTeam: Team): string {
  const week = String(game.week).padStart(2, '0')
  return `${game.season}_${week}_${awayTeam.team_id}_${homeTeam.team_id}`
}

/**
 * Fetches just the basic game info for metadata/SEO
 */
export async function getGameMetadata(gameId: string): Promise<{
  game: Game
  homeTeam: Team
  awayTeam: Team
} | null> {
  const supabase = await createClient()

  const { data: game, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('game_id', gameId)
    .single()

  if (error || !game) {
    return null
  }

  return {
    game: game as Game,
    homeTeam: game.home_team as Team,
    awayTeam: game.away_team as Team
  }
}

/**
 * Get list of all game IDs for static generation
 */
export async function getAllGameIds(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('game_id')
    .order('game_date', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('Error fetching game IDs:', error)
    return []
  }

  return (data || []).map(g => g.game_id)
}
