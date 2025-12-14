import { createClient } from '@/lib/supabase/server'
import type {
  TableFreshness,
  TableStats,
  CoverageData,
  CoverageCell,
  ActivityEntry,
  FreshnessStatus,
} from '@/types/admin'
import { MONITORED_TABLES, FRESHNESS_THRESHOLDS } from '@/types/admin'

/**
 * Calculate freshness status based on last updated time and table category
 */
function calculateFreshnessStatus(
  lastUpdated: string | null,
  category: 'live' | 'daily' | 'weekly'
): FreshnessStatus {
  if (!lastUpdated) return 'unknown'

  const now = new Date()
  const updated = new Date(lastUpdated)
  const diffMinutes = (now.getTime() - updated.getTime()) / (1000 * 60)

  const thresholds = FRESHNESS_THRESHOLDS[category]

  if (diffMinutes < thresholds.fresh) return 'fresh'
  if (diffMinutes < thresholds.aging) return 'aging'
  return 'stale'
}

/**
 * Get freshness data for all monitored tables
 */
export async function getTableFreshness(): Promise<TableFreshness[]> {
  const supabase = await createClient()
  const results: TableFreshness[] = []

  for (const table of MONITORED_TABLES) {
    try {
      // Get most recent updated_at and count
      const { data, count } = await supabase
        .from(table.name)
        .select('updated_at', { count: 'exact', head: false })
        .order('updated_at', { ascending: false })
        .limit(1)

      const lastUpdated = data?.[0]?.updated_at || null

      results.push({
        table_name: table.name,
        display_name: table.display,
        last_updated: lastUpdated,
        status: calculateFreshnessStatus(lastUpdated, table.category),
        row_count: count || 0,
      })
    } catch {
      // Table might not have updated_at column, try without it
      try {
        const { count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })

        results.push({
          table_name: table.name,
          display_name: table.display,
          last_updated: null,
          status: 'unknown',
          row_count: count || 0,
        })
      } catch {
        results.push({
          table_name: table.name,
          display_name: table.display,
          last_updated: null,
          status: 'unknown',
          row_count: 0,
        })
      }
    }
  }

  return results
}

/**
 * Get row counts for all monitored tables
 */
export async function getTableStats(): Promise<TableStats[]> {
  const supabase = await createClient()
  const results: TableStats[] = []

  for (const table of MONITORED_TABLES) {
    try {
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      results.push({
        table_name: table.name,
        display_name: table.display,
        row_count: count || 0,
      })
    } catch {
      results.push({
        table_name: table.name,
        display_name: table.display,
        row_count: 0,
      })
    }
  }

  return results
}

/**
 * Get coverage map showing which seasons/weeks have game data
 */
export async function getCoverageMap(): Promise<CoverageData> {
  const supabase = await createClient()

  // Get all games grouped by season and week
  const { data: games } = await supabase
    .from('games')
    .select('season, week')
    .order('season', { ascending: false })
    .order('week', { ascending: true })

  if (!games || games.length === 0) {
    return { seasons: [], weeks: [], cells: [] }
  }

  // Get unique seasons and weeks
  const seasons = [...new Set(games.map((g) => g.season))].sort((a, b) => b - a)
  const weeks = [...new Set(games.map((g) => g.week))].sort((a, b) => a - b)

  // Count games per season/week
  const gameCountMap = new Map<string, number>()
  games.forEach((g) => {
    const key = `${g.season}-${g.week}`
    gameCountMap.set(key, (gameCountMap.get(key) || 0) + 1)
  })

  // Build cells
  const cells: CoverageCell[] = []
  for (const season of seasons) {
    for (const week of weeks) {
      const key = `${season}-${week}`
      const count = gameCountMap.get(key) || 0
      cells.push({
        season,
        week,
        has_data: count > 0,
        game_count: count,
      })
    }
  }

  return { seasons, weeks, cells }
}

/**
 * Get recent activity based on updated_at timestamps across tables
 * Since we don't have a dedicated activity log, we infer from recent updates
 */
export async function getRecentActivity(limit: number = 20): Promise<ActivityEntry[]> {
  const supabase = await createClient()
  const activities: ActivityEntry[] = []

  // Check tables with updated_at for recent changes
  const tablesToCheck = [
    { name: 'games', display: 'Games' },
    { name: 'live_plays', display: 'Live Plays' },
    { name: 'live_drives', display: 'Live Drives' },
    { name: 'win_probability', display: 'Win Probability' },
    { name: 'player_game_stats', display: 'Player Stats' },
    { name: 'team_game_stats', display: 'Team Stats' },
  ]

  for (const table of tablesToCheck) {
    try {
      const { data } = await supabase
        .from(table.name)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (data && data.length > 0) {
        // Group by timestamp (rounded to minute) to show batch updates
        const grouped = new Map<string, number>()
        data.forEach((row) => {
          if (row.updated_at) {
            const minute = row.updated_at.substring(0, 16) // YYYY-MM-DDTHH:MM
            grouped.set(minute, (grouped.get(minute) || 0) + 1)
          }
        })

        grouped.forEach((count, timestamp) => {
          activities.push({
            id: `${table.name}-${timestamp}`,
            table_name: table.display,
            action: 'update',
            timestamp: timestamp + ':00Z',
            row_count: count,
            description: `${count} row${count > 1 ? 's' : ''} updated`,
          })
        })
      }
    } catch {
      // Skip tables without updated_at
    }
  }

  // Sort by timestamp descending and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

/**
 * Get all admin dashboard data in one call
 */
export async function getAdminDashboardData() {
  const [freshness, stats, coverage, activity] = await Promise.all([
    getTableFreshness(),
    getTableStats(),
    getCoverageMap(),
    getRecentActivity(),
  ])

  return {
    freshness,
    stats,
    coverage,
    activity,
    last_refresh: new Date().toISOString(),
  }
}

/**
 * Get recent games for scrapers status page
 */
export async function getRecentGames(limit: number = 16) {
  const supabase = await createClient()

  const { data: games } = await supabase
    .from('games')
    .select(`
      game_id,
      status,
      home_score,
      away_score,
      game_date,
      week,
      season,
      home_team:teams!home_team_id(team_id, team_abbr),
      away_team:teams!away_team_id(team_id, team_abbr)
    `)
    .order('game_date', { ascending: false })
    .limit(limit)

  // Transform the data to match expected types (Supabase returns single objects, not arrays)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (games || []).map((game: any) => ({
    game_id: game.game_id,
    status: game.status,
    home_score: game.home_score,
    away_score: game.away_score,
    game_date: game.game_date,
    week: game.week,
    season: game.season,
    home_team: game.home_team,
    away_team: game.away_team,
  }))
}

/**
 * Get scrapers page data
 */
export async function getScrapersData() {
  const [recentGames, freshness] = await Promise.all([
    getRecentGames(16),
    getTableFreshness(),
  ])

  // Calculate status counts
  const statusCounts = recentGames.reduce(
    (acc, game) => {
      const status = game.status?.toLowerCase() || 'unknown'
      if (status === 'final') acc.final++
      else if (status === 'in_progress' || status === 'in progress') acc.inProgress++
      else if (status === 'scheduled') acc.scheduled++
      return acc
    },
    { final: 0, inProgress: 0, scheduled: 0 }
  )

  return {
    recentGames,
    freshness,
    statusCounts,
    last_refresh: new Date().toISOString(),
  }
}
