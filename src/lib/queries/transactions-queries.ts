import { createClient } from '@/lib/supabase/server'
import type { RosterTransaction, Team, Player } from '@/types/game'

/**
 * Fetch recent roster transactions with player and team details
 */
export async function getRecentTransactions(limit: number = 50): Promise<RosterTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roster_transactions')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number),
      team:teams(team_id, team_abbr, team_name, logo_url)
    `)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return (data || []) as RosterTransaction[]
}

/**
 * Fetch transactions for a specific team
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
 * Fetch transactions for a specific date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
  limit: number = 100
): Promise<RosterTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roster_transactions')
    .select(`
      *,
      player:players(player_id, full_name, primary_position, jersey_number),
      team:teams(team_id, team_abbr, team_name, logo_url)
    `)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions by date range:', error)
    return []
  }

  return (data || []) as RosterTransaction[]
}

/**
 * Get transaction counts by type
 */
export async function getTransactionStats(): Promise<{
  total: number
  signed: number
  released: number
  traded: number
}> {
  const supabase = await createClient()

  const { count: total } = await supabase
    .from('roster_transactions')
    .select('*', { count: 'exact', head: true })

  const { count: signed } = await supabase
    .from('roster_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'signed')

  const { count: released } = await supabase
    .from('roster_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'released')

  const { count: traded } = await supabase
    .from('roster_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('transaction_type', 'traded')

  return {
    total: total || 0,
    signed: signed || 0,
    released: released || 0,
    traded: traded || 0
  }
}
