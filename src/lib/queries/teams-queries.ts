import { createClient } from '@/lib/supabase/server'
import type { Team, Game, RosterTransaction } from '@/types/game'

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
