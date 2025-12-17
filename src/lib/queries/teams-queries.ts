import { createClient } from '@/lib/supabase/server'
import type { Team, Game, RosterTransaction, Player } from '@/types/game'

/**
 * Player stat leader type for team stat leaders
 */
export interface PlayerStatLeader {
  player_id: string
  full_name: string
  primary_position: string
  jersey_number: number | null
  stat_value: number
}

/**
 * Fetch all NFL teams
 */
export async function getAllTeams(): Promise<Team[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('conference')
    .order('division')
    .order('team_name')

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }

  return (data || []) as Team[]
}

/**
 * Fetch a single team by ID
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('team_id', teamId)
    .single()

  if (error) {
    console.error('Error fetching team:', error)
    return null
  }

  return data as Team
}

/**
 * Fetch team's schedule for a season
 */
export async function getTeamSchedule(teamId: string, season: number = 2025): Promise<Game[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('season', season)
    .order('week', { ascending: true })

  if (error) {
    console.error('Error fetching team schedule:', error)
    return []
  }

  return (data || []) as Game[]
}

/**
 * Fetch team's recent transactions
 */
export async function getTeamTransactions(teamId: string, limit: number = 20): Promise<RosterTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roster_transactions')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number),
      team:teams(team_id, team_abbr, team_name, logo_url)
    `)
    .eq('team_id', teamId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching team transactions:', error)
    return []
  }

  return (data || []) as RosterTransaction[]
}

/**
 * Fetch team's season record (W-L-T)
 */
export async function getTeamRecord(teamId: string, season: number = 2025): Promise<{
  wins: number
  losses: number
  ties: number
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('home_team_id, away_team_id, home_score, away_score')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('season', season)
    .eq('status', 'final')

  if (error || !data) {
    return { wins: 0, losses: 0, ties: 0 }
  }

  let wins = 0, losses = 0, ties = 0

  for (const game of data) {
    const isHome = game.home_team_id === teamId
    const teamScore = isHome ? game.home_score : game.away_score
    const oppScore = isHome ? game.away_score : game.home_score

    if (teamScore === null || oppScore === null) continue

    if (teamScore > oppScore) wins++
    else if (teamScore < oppScore) losses++
    else ties++
  }

  return { wins, losses, ties }
}

/**
 * Get teams grouped by division
 */
export async function getTeamsByDivision(): Promise<Record<string, Team[]>> {
  const teams = await getAllTeams()

  const grouped: Record<string, Team[]> = {}

  for (const team of teams) {
    const key = `${team.conference} ${team.division}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(team)
  }

  return grouped
}

/**
 * Roster player type (subset of Player fields needed for display)
 */
export interface RosterPlayer {
  player_id: string
  full_name: string
  primary_position: string
  jersey_number: number | null
  height: string | null
  weight: number | null
  college: string | null
  birth_date: string | null
}

/**
 * Fetch team roster using current_team_id
 */
export async function getTeamRoster(teamId: string): Promise<RosterPlayer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select('player_id, full_name, primary_position, jersey_number, height, weight, college, birth_date')
    .eq('current_team_id', teamId)
    .order('primary_position')
    .order('full_name')

  if (error) {
    console.error('Error fetching team roster:', error)
    return []
  }

  return (data || []) as RosterPlayer[]
}

/**
 * Fetch team stat leaders for passing, rushing, receiving
 */
export async function getTeamStatLeaders(teamId: string, season: number = 2024): Promise<{
  passing: PlayerStatLeader[]
  rushing: PlayerStatLeader[]
  receiving: PlayerStatLeader[]
}> {
  const supabase = await createClient()

  // Get all player stats for this team this season
  const { data: stats, error } = await supabase
    .from('player_game_stats')
    .select(`
      player_id,
      passing_yards,
      passing_tds,
      rushing_yards,
      rushing_tds,
      receiving_yards,
      receiving_tds,
      receptions,
      players!inner(player_id, full_name, primary_position, jersey_number, current_team_id)
    `)
    .eq('team_id', teamId)
    .eq('season', season)

  if (error || !stats) {
    console.error('Error fetching team stat leaders:', error)
    return { passing: [], rushing: [], receiving: [] }
  }

  // Aggregate stats by player
  const playerStats: Record<string, {
    player_id: string
    full_name: string
    primary_position: string
    jersey_number: number | null
    passing_yards: number
    rushing_yards: number
    receiving_yards: number
  }> = {}

  for (const stat of stats) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerData = stat.players as any
    if (!playerData) continue
    const player = {
      player_id: playerData.player_id as string,
      full_name: playerData.full_name as string,
      primary_position: playerData.primary_position as string,
      jersey_number: playerData.jersey_number as number | null
    }

    if (!playerStats[stat.player_id]) {
      playerStats[stat.player_id] = {
        player_id: stat.player_id,
        full_name: player.full_name,
        primary_position: player.primary_position,
        jersey_number: player.jersey_number,
        passing_yards: 0,
        rushing_yards: 0,
        receiving_yards: 0
      }
    }

    playerStats[stat.player_id].passing_yards += stat.passing_yards || 0
    playerStats[stat.player_id].rushing_yards += stat.rushing_yards || 0
    playerStats[stat.player_id].receiving_yards += stat.receiving_yards || 0
  }

  const players = Object.values(playerStats)

  // Sort and get top 5 for each category
  const passing = players
    .filter(p => p.passing_yards > 0)
    .sort((a, b) => b.passing_yards - a.passing_yards)
    .slice(0, 5)
    .map(p => ({ ...p, stat_value: p.passing_yards }))

  const rushing = players
    .filter(p => p.rushing_yards > 0)
    .sort((a, b) => b.rushing_yards - a.rushing_yards)
    .slice(0, 5)
    .map(p => ({ ...p, stat_value: p.rushing_yards }))

  const receiving = players
    .filter(p => p.receiving_yards > 0)
    .sort((a, b) => b.receiving_yards - a.receiving_yards)
    .slice(0, 5)
    .map(p => ({ ...p, stat_value: p.receiving_yards }))

  return { passing, rushing, receiving }
}
