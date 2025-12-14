import { createClient } from '@/lib/supabase/server'
import type { PlayerInjury } from '@/types/game'

/**
 * Fetch all current injuries
 */
export async function getActiveInjuries(season: number = 2025): Promise<PlayerInjury[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('player_injuries')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number, current_team_id)
    `)
    .eq('season', season)
    .is('return_date', null)
    .order('injury_date', { ascending: false })

  if (error) {
    console.error('Error fetching injuries:', error)
    return []
  }

  return (data || []) as PlayerInjury[]
}

/**
 * Fetch all injuries for a season
 */
export async function getAllInjuries(season: number = 2025, limit: number = 100): Promise<PlayerInjury[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('player_injuries')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number, current_team_id)
    `)
    .eq('season', season)
    .order('injury_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching injuries:', error)
    return []
  }

  return (data || []) as PlayerInjury[]
}

/**
 * Fetch injuries for a specific team
 */
export async function getTeamInjuries(teamId: string, season: number = 2025): Promise<PlayerInjury[]> {
  const supabase = await createClient()

  // First get player IDs for the team
  const { data: playerData } = await supabase
    .from('players')
    .select('player_id')
    .eq('current_team_id', teamId)

  if (!playerData || playerData.length === 0) {
    return []
  }

  const playerIds = playerData.map(p => p.player_id)

  const { data, error } = await supabase
    .from('player_injuries')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number, current_team_id)
    `)
    .eq('season', season)
    .in('player_id', playerIds)
    .order('injury_date', { ascending: false })

  if (error) {
    console.error('Error fetching team injuries:', error)
    return []
  }

  return (data || []) as PlayerInjury[]
}

/**
 * Get injury counts by type
 */
export async function getInjuryStats(season: number = 2025): Promise<{
  total: number
  active: number
  returned: number
}> {
  const supabase = await createClient()

  const { count: total } = await supabase
    .from('player_injuries')
    .select('*', { count: 'exact', head: true })
    .eq('season', season)

  const { count: active } = await supabase
    .from('player_injuries')
    .select('*', { count: 'exact', head: true })
    .eq('season', season)
    .is('return_date', null)

  return {
    total: total || 0,
    active: active || 0,
    returned: (total || 0) - (active || 0)
  }
}
