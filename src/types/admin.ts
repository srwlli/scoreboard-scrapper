// Admin Dashboard Types
// WO-ADMIN-DASHBOARD-001

export type FreshnessStatus = 'fresh' | 'aging' | 'stale' | 'unknown'

export interface TableFreshness {
  table_name: string
  display_name: string
  last_updated: string | null
  status: FreshnessStatus
  row_count: number
}

export interface TableStats {
  table_name: string
  display_name: string
  row_count: number
  size_estimate?: string
}

export interface CoverageCell {
  season: number
  week: number
  has_data: boolean
  game_count: number
}

export interface CoverageData {
  seasons: number[]
  weeks: number[]
  cells: CoverageCell[]
}

export interface ActivityEntry {
  id: string
  table_name: string
  action: 'insert' | 'update' | 'delete'
  timestamp: string
  row_count: number
  description?: string
}

export interface AdminDashboardData {
  freshness: TableFreshness[]
  stats: TableStats[]
  coverage: CoverageData
  activity: ActivityEntry[]
  last_refresh: string
}

// Freshness thresholds in minutes
export const FRESHNESS_THRESHOLDS = {
  // Real-time tables (live scrapers)
  live: {
    fresh: 5,      // < 5 min = green
    aging: 30,     // < 30 min = yellow
    // > 30 min = red
  },
  // Daily tables
  daily: {
    fresh: 60 * 24,      // < 24 hours = green
    aging: 60 * 24 * 2,  // < 48 hours = yellow
    // > 48 hours = red
  },
  // Weekly tables
  weekly: {
    fresh: 60 * 24 * 7,      // < 7 days = green
    aging: 60 * 24 * 10,     // < 10 days = yellow
    // > 10 days = red
  },
}

// Table configuration for the dashboard
export const MONITORED_TABLES: Array<{
  name: string
  display: string
  category: 'live' | 'daily' | 'weekly'
}> = [
  // Live/Real-time tables
  { name: 'games', display: 'Games', category: 'live' },
  { name: 'live_plays', display: 'Live Plays', category: 'live' },
  { name: 'live_drives', display: 'Live Drives', category: 'live' },
  { name: 'win_probability', display: 'Win Probability', category: 'live' },

  // Daily tables
  { name: 'team_season_stats', display: 'Team Season Stats', category: 'daily' },
  { name: 'player_injuries', display: 'Player Injuries', category: 'daily' },
  { name: 'roster_transactions', display: 'Roster Transactions', category: 'daily' },

  // Weekly/On-demand tables
  { name: 'player_game_stats', display: 'Player Game Stats', category: 'weekly' },
  { name: 'team_game_stats', display: 'Team Game Stats', category: 'weekly' },
  { name: 'scoring_plays', display: 'Scoring Plays', category: 'weekly' },
  { name: 'play_by_play', display: 'Play by Play', category: 'weekly' },
  { name: 'snap_counts', display: 'Snap Counts', category: 'weekly' },
  { name: 'ngs_passing', display: 'NGS Passing', category: 'weekly' },
  { name: 'ngs_rushing', display: 'NGS Rushing', category: 'weekly' },
  { name: 'ngs_receiving', display: 'NGS Receiving', category: 'weekly' },
  { name: 'game_weather', display: 'Game Weather', category: 'weekly' },
]
