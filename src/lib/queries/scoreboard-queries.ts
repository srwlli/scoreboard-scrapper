import { createClient } from '@/lib/supabase/server'
import type { Game, Team, ScoreboardGame } from '@/types/game'

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('team_name')

  if (error) throw error
  return data || []
}

export async function getAvailableSeasons(): Promise<number[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('season')
    .order('season', { ascending: false })

  if (error) throw error

  // Get unique seasons
  const seasons = [...new Set(data?.map(g => g.season) || [])]
  return seasons
}

export async function getGamesForWeek(
  season: number,
  week: number
): Promise<ScoreboardGame[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('season', season)
    .eq('week', week)
    .order('game_date')
    .order('game_time')

  if (error) throw error
  return (data || []) as ScoreboardGame[]
}

export async function getGamesForTeam(
  season: number,
  teamId: string
): Promise<ScoreboardGame[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('season', season)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('week')

  if (error) throw error
  return (data || []) as ScoreboardGame[]
}

export async function getMaxWeekForSeason(season: number): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('week')
    .eq('season', season)
    .order('week', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0]?.week || 18
}
