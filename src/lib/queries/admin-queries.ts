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
    const tsColumn = table.tsColumn || 'updated_at'

    try {
      // Get most recent timestamp and count
      const { data, count } = await supabase
        .from(table.name)
        .select(tsColumn, { count: 'exact', head: false })
        .order(tsColumn, { ascending: false })
        .limit(1)

      const lastUpdated = data?.[0] ? (data[0] as unknown as Record<string, string>)[tsColumn] : null

      results.push({
        table_name: table.name,
        display_name: table.display,
        last_updated: lastUpdated,
        status: calculateFreshnessStatus(lastUpdated, table.category),
        row_count: count || 0,
      })
    } catch {
      // Table might not have the timestamp column, try without it
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
 * Build metadata description for activity entries
 * Uses actual columns available in each table
 */
function buildMetadataDescription(
  tableName: string,
  count: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]
): string {
  switch (tableName) {
    case 'game_videos': {
      // game_videos has video_type but not week
      const types = new Map<string, number>()
      rows.forEach((r) => {
        if (r.video_type) types.set(r.video_type, (types.get(r.video_type) || 0) + 1)
      })
      if (types.size > 0) {
        const typeStr = Array.from(types.entries())
          .map(([t, c]) => `${c} ${t}`)
          .join(', ')
        return typeStr
      }
      return `${count} videos`
    }
    case 'games': {
      // games has week column
      const weeks = new Set<number>()
      rows.forEach((r) => { if (r.week) weeks.add(r.week) })
      const weekArr = Array.from(weeks).sort((a, b) => a - b)
      const weekStr = weekArr.length > 1
        ? `Weeks ${weekArr[0]}-${weekArr[weekArr.length - 1]}`
        : weekArr.length === 1 ? `Week ${weekArr[0]}` : ''
      return weekStr ? `${count} games (${weekStr})` : `${count} games`
    }
    case 'live_plays': {
      // live_plays has season but not week
      const seasons = new Set<number>()
      rows.forEach((r) => { if (r.season) seasons.add(r.season) })
      const seasonStr = seasons.size > 0 ? Array.from(seasons).join(', ') : ''
      return seasonStr ? `${count} plays (${seasonStr})` : `${count} plays`
    }
    case 'live_drives': {
      // live_drives has season but not week
      const seasons = new Set<number>()
      rows.forEach((r) => { if (r.season) seasons.add(r.season) })
      const seasonStr = seasons.size > 0 ? Array.from(seasons).join(', ') : ''
      return seasonStr ? `${count} drives (${seasonStr})` : `${count} drives`
    }
    case 'win_probability': {
      // win_probability has season but not week
      const seasons = new Set<number>()
      rows.forEach((r) => { if (r.season) seasons.add(r.season) })
      const seasonStr = seasons.size > 0 ? Array.from(seasons).join(', ') : ''
      return seasonStr ? `${count.toLocaleString()} entries (${seasonStr})` : `${count.toLocaleString()} entries`
    }
    case 'player_game_stats': {
      // player_game_stats has season but not week
      const seasons = new Set<number>()
      rows.forEach((r) => { if (r.season) seasons.add(r.season) })
      const seasonStr = seasons.size > 0 ? Array.from(seasons).join(', ') : ''
      return seasonStr ? `${count} player stats (${seasonStr})` : `${count} player stats`
    }
    case 'team_game_stats': {
      // team_game_stats has season but not week
      const seasons = new Set<number>()
      rows.forEach((r) => { if (r.season) seasons.add(r.season) })
      const seasonStr = seasons.size > 0 ? Array.from(seasons).join(', ') : ''
      return seasonStr ? `${count} team stats (${seasonStr})` : `${count} team stats`
    }
    case 'player_injuries': {
      // player_injuries has injury_type, not team_id
      const types = new Map<string, number>()
      rows.forEach((r) => {
        if (r.injury_type) types.set(r.injury_type, (types.get(r.injury_type) || 0) + 1)
      })
      if (types.size > 0) {
        const breakdown = Array.from(types.entries())
          .slice(0, 3)
          .map(([t, c]) => `${c} ${t}`)
          .join(', ')
        return `${count} injuries (${breakdown})`
      }
      return `${count} injuries`
    }
    case 'roster_transactions': {
      const types = new Map<string, number>()
      rows.forEach((r) => {
        if (r.transaction_type) types.set(r.transaction_type, (types.get(r.transaction_type) || 0) + 1)
      })
      if (types.size > 0) {
        const breakdown = Array.from(types.entries())
          .slice(0, 3)  // Limit to 3 types
          .map(([t, c]) => `${c} ${t}`)
          .join(', ')
        return `${count} transactions (${breakdown})`
      }
      return `${count} transactions`
    }
    default:
      return `${count} row${count > 1 ? 's' : ''} updated`
  }
}

/**
 * Get recent activity based on updated_at timestamps across tables
 * Since we don't have a dedicated activity log, we infer from recent updates
 * Enhanced with metadata aggregation for contextual descriptions
 */
export async function getRecentActivity(limit: number = 20): Promise<ActivityEntry[]> {
  const supabase = await createClient()
  const activities: ActivityEntry[] = []

  // Check tables with timestamp columns for recent changes
  // Each table specifies which timestamp column and metadata columns to use
  // Note: Using actual columns that exist in each table
  const tablesToCheck = [
    { name: 'games', display: 'Games', tsColumn: 'updated_at', metaCols: 'week,season' },
    { name: 'live_plays', display: 'Live Plays', tsColumn: 'updated_at', metaCols: 'season' },
    { name: 'live_drives', display: 'Live Drives', tsColumn: 'updated_at', metaCols: 'season' },
    { name: 'win_probability', display: 'Win Probability', tsColumn: 'created_at', metaCols: 'season' },
    { name: 'player_game_stats', display: 'Player Stats', tsColumn: 'updated_at', metaCols: 'season' },
    { name: 'team_game_stats', display: 'Team Stats', tsColumn: 'updated_at', metaCols: 'season' },
    { name: 'game_videos', display: 'YouTube Videos', tsColumn: 'scraped_at', metaCols: 'video_type' },
    { name: 'player_injuries', display: 'Injuries', tsColumn: 'updated_at', metaCols: 'injury_type' },
    { name: 'roster_transactions', display: 'Transactions', tsColumn: 'created_at', metaCols: 'transaction_type' },
  ]

  for (const table of tablesToCheck) {
    try {
      // Fetch more rows to get better metadata context
      const selectCols = [table.tsColumn, ...table.metaCols.split(',')].join(',')
      const { data } = await supabase
        .from(table.name)
        .select(selectCols)
        .order(table.tsColumn, { ascending: false })
        .limit(100)

      if (data && data.length > 0) {
        // Group by timestamp (rounded to minute) to show batch updates
        const grouped = new Map<string, { count: number; rows: typeof data }>()
        data.forEach((row) => {
          const ts = (row as unknown as Record<string, string>)[table.tsColumn]
          if (ts) {
            const minute = ts.substring(0, 16) // YYYY-MM-DDTHH:MM
            const existing = grouped.get(minute)
            if (existing) {
              existing.count++
              existing.rows.push(row)
            } else {
              grouped.set(minute, { count: 1, rows: [row] })
            }
          }
        })

        grouped.forEach(({ count, rows }, timestamp) => {
          const metadata = buildMetadataDescription(table.name, count, rows)
          activities.push({
            id: `${table.name}-${timestamp}`,
            table_name: table.display,
            action: 'update',
            timestamp: timestamp + ':00Z',
            row_count: count,
            description: `${count} row${count > 1 ? 's' : ''} updated`,
            metadata,
          })
        })
      }
    } catch {
      // Skip tables that error (missing column, etc)
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
