// Data Maps Configuration
// Centralized field definitions with metadata for the Data Maps page

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'
export type KeyType = 'PK' | 'FK' | 'UK' | undefined
export type DataType = 'table' | 'view' | 'client'

export interface FieldDefinition {
  field: string
  type: FieldType
  nullable: boolean
  key?: KeyType
  fkRef?: string
  example?: string
  description?: string
}

export interface SectionDefinition {
  title: string
  table: string
  dataType: DataType  // table, view, or client-computed
  scraper: string
  schedule: string
  source: 'ESPN API' | 'nflverse' | 'Open-Meteo' | 'The Odds API' | 'Database' | 'Client'
  primaryKey: string
  recordCount?: string
  displayFormat?: string  // Optional description of how data is displayed in UI
  fields: FieldDefinition[]
}

// Source color mapping
export const SOURCE_COLORS: Record<string, string> = {
  'ESPN API': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  'nflverse': 'bg-green-500/20 text-green-600 dark:text-green-400',
  'Open-Meteo': 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  'The Odds API': 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  'Database': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  'Client': 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
}

// Schedule color mapping
export const SCHEDULE_COLORS: Record<string, string> = {
  'real-time': 'bg-red-500/20 text-red-600 dark:text-red-400',
  'daily': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  'weekly': 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  'triggered': 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
  'seed': 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
}

// Data type color mapping
export const DATA_TYPE_COLORS: Record<DataType, string> = {
  'table': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  'view': 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  'client': 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
}

// Data type icons/labels
export const DATA_TYPE_LABELS: Record<DataType, string> = {
  'table': '📦 Table',
  'view': '👁️ View',
  'client': '💻 Client',
}

export function getScheduleType(schedule: string): string {
  if (schedule.includes('30s') || schedule.includes('real-time')) return 'real-time'
  if (schedule.includes('Daily')) return 'daily'
  if (schedule.includes('Weekly')) return 'weekly'
  if (schedule.includes('complete') || schedule.includes('triggered')) return 'triggered'
  return 'seed'
}

// =============================================================================
// SCOREBOARD TAB DATA
// =============================================================================

export const SCOREBOARD_SECTIONS: SectionDefinition[] = [
  {
    title: 'Game Info',
    table: 'games',
    dataType: 'table',
    scraper: 'schedule / live-games',
    schedule: 'Weekly Mon 3AM / Every 30s',
    source: 'ESPN API',
    primaryKey: '(game_id, season)',
    recordCount: '~272/season',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'PK', example: 'espn-401772941', description: 'ESPN game identifier' },
      { field: 'game_date', type: 'date', nullable: false, example: '2025-10-17', description: 'Game date' },
      { field: 'game_time', type: 'string', nullable: true, example: '00:15:00', description: 'Game time (UTC)' },
      { field: 'week', type: 'number', nullable: false, example: '7', description: 'Week number (1-18)' },
      { field: 'status', type: 'enum', nullable: false, example: 'final', description: 'scheduled | in_progress | final' },
      { field: 'home_score', type: 'number', nullable: true, example: '27', description: 'Home team final score' },
      { field: 'away_score', type: 'number', nullable: true, example: '24', description: 'Away team final score' },
    ],
  },
  {
    title: 'Team Info',
    table: 'teams',
    dataType: 'table',
    scraper: 'seed',
    schedule: 'One-time seed',
    source: 'ESPN API',
    primaryKey: 'team_id',
    recordCount: '32 teams',
    fields: [
      { field: 'team_id', type: 'string', nullable: false, key: 'PK', example: 'KC', description: '2-3 letter team code' },
      { field: 'team_name', type: 'string', nullable: false, example: 'Kansas City Chiefs', description: 'Full team name' },
      { field: 'team_abbr', type: 'string', nullable: false, example: 'KC', description: 'Team abbreviation' },
      { field: 'logo_url', type: 'string', nullable: true, example: 'https://a.espncdn.com/...', description: 'Team logo URL' },
    ],
  },
  {
    title: 'Calculated Fields',
    table: 'client',
    dataType: 'client',
    scraper: 'client',
    schedule: 'On render',
    source: 'Client',
    primaryKey: 'N/A',
    fields: [
      { field: 'home_record', type: 'string', nullable: false, example: '5-2', description: 'Home team W-L record' },
      { field: 'away_record', type: 'string', nullable: false, example: '4-3', description: 'Away team W-L record' },
    ],
  },
]

// =============================================================================
// GAME DETAILS TAB DATA
// =============================================================================

export const GAME_DETAILS_SECTIONS: SectionDefinition[] = [
  {
    title: 'Scorebug',
    table: 'games',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(game_id, season)',
    recordCount: '~272/season',
    fields: [
      { field: 'home_score', type: 'number', nullable: true, example: '27', description: 'Home team total score' },
      { field: 'away_score', type: 'number', nullable: true, example: '24', description: 'Away team total score' },
      { field: 'home_q1_score', type: 'number', nullable: true, example: '7', description: 'Home Q1 score' },
      { field: 'home_q2_score', type: 'number', nullable: true, example: '10', description: 'Home Q2 score' },
      { field: 'home_q3_score', type: 'number', nullable: true, example: '3', description: 'Home Q3 score' },
      { field: 'home_q4_score', type: 'number', nullable: true, example: '7', description: 'Home Q4 score' },
      { field: 'home_ot_score', type: 'number', nullable: true, example: '0', description: 'Home OT score' },
      { field: 'away_q1_score', type: 'number', nullable: true, example: '3', description: 'Away Q1 score' },
      { field: 'away_q2_score', type: 'number', nullable: true, example: '7', description: 'Away Q2 score' },
      { field: 'away_q3_score', type: 'number', nullable: true, example: '7', description: 'Away Q3 score' },
      { field: 'away_q4_score', type: 'number', nullable: true, example: '7', description: 'Away Q4 score' },
      { field: 'away_ot_score', type: 'number', nullable: true, example: '0', description: 'Away OT score' },
    ],
  },
  {
    title: 'Venue',
    table: 'stadiums',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: 'stadium_id',
    recordCount: '30 stadiums',
    fields: [
      { field: 'stadium_id', type: 'string', nullable: false, key: 'PK', example: 'state-farm-stadium', description: 'Stadium identifier' },
      { field: 'stadium_name', type: 'string', nullable: false, example: 'State Farm Stadium', description: 'Stadium name' },
      { field: 'city', type: 'string', nullable: false, example: 'Glendale', description: 'City location' },
      { field: 'state', type: 'string', nullable: true, example: 'AZ', description: 'State/region' },
      { field: 'capacity', type: 'number', nullable: true, example: '63400', description: 'Stadium capacity' },
      { field: 'surface_type', type: 'string', nullable: true, example: 'Grass', description: 'Playing surface' },
      { field: 'roof_type', type: 'enum', nullable: true, example: 'Retractable', description: 'Open | Dome | Retractable' },
      { field: 'opened_year', type: 'number', nullable: true, example: '2006', description: 'Year stadium opened' },
    ],
  },
  {
    title: 'Weather',
    table: 'game_weather',
    dataType: 'table',
    scraper: 'weather-scraper',
    schedule: 'Weekly Tue (manual)',
    source: 'Open-Meteo',
    primaryKey: 'game_id',
    recordCount: '~159 (outdoor games)',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772941', description: 'Game reference' },
      { field: 'temperature_fahrenheit', type: 'number', nullable: true, example: '72', description: 'Temperature in F' },
      { field: 'humidity_percentage', type: 'number', nullable: true, example: '45', description: 'Humidity %' },
      { field: 'wind_speed_mph', type: 'number', nullable: true, example: '8', description: 'Wind speed in MPH' },
      { field: 'wind_direction', type: 'string', nullable: true, example: 'NW', description: 'Wind direction' },
      { field: 'conditions', type: 'string', nullable: true, example: 'Clear', description: 'Weather conditions' },
      { field: 'precipitation', type: 'string', nullable: true, example: 'None', description: 'Precipitation type' },
    ],
  },
  {
    title: 'Team Stats',
    table: 'team_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(team_id, game_id)',
    recordCount: '~544/season',
    fields: [
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Team reference' },
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772941', description: 'Game reference' },
      { field: 'total_yards', type: 'number', nullable: true, example: '385', description: 'Total offensive yards' },
      { field: 'passing_yards', type: 'number', nullable: true, example: '245', description: 'Total passing yards' },
      { field: 'rushing_yards', type: 'number', nullable: true, example: '140', description: 'Total rushing yards' },
      { field: 'first_downs', type: 'number', nullable: true, example: '22', description: 'Total first downs' },
      { field: 'third_down_conversions', type: 'number', nullable: true, example: '6', description: '3rd down conversions' },
      { field: 'third_down_attempts', type: 'number', nullable: true, example: '12', description: '3rd down attempts' },
      { field: 'fourth_down_conversions', type: 'number', nullable: true, example: '1', description: '4th down conversions' },
      { field: 'fourth_down_attempts', type: 'number', nullable: true, example: '2', description: '4th down attempts' },
      { field: 'red_zone_scores', type: 'number', nullable: true, example: '3', description: 'Red zone scores' },
      { field: 'red_zone_attempts', type: 'number', nullable: true, example: '4', description: 'Red zone attempts' },
      { field: 'penalties', type: 'number', nullable: true, example: '5', description: 'Penalties committed' },
      { field: 'penalty_yards', type: 'number', nullable: true, example: '45', description: 'Penalty yards' },
      { field: 'turnovers', type: 'number', nullable: true, example: '1', description: 'Turnovers committed' },
      { field: 'time_of_possession_seconds', type: 'number', nullable: true, example: '1845', description: 'Time of possession' },
      { field: 'pass_completions', type: 'number', nullable: true, example: '22', description: 'Pass completions' },
      { field: 'pass_attempts', type: 'number', nullable: true, example: '35', description: 'Pass attempts' },
      { field: 'yards_per_pass', type: 'number', nullable: true, example: '7.2', description: 'Yards per pass attempt' },
      { field: 'yards_per_rush', type: 'number', nullable: true, example: '4.5', description: 'Yards per rush attempt' },
      { field: 'interceptions_thrown', type: 'number', nullable: true, example: '1', description: 'Interceptions thrown' },
      { field: 'fumbles_lost', type: 'number', nullable: true, example: '0', description: 'Fumbles lost' },
      { field: 'sacks_allowed', type: 'number', nullable: true, example: '2', description: 'Sacks allowed' },
      { field: 'sack_yards_lost', type: 'number', nullable: true, example: '15', description: 'Sack yards lost' },
    ],
  },
  {
    title: 'Scoring Plays',
    table: 'scoring_plays',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: 'scoring_play_id',
    recordCount: '~2,500/season',
    fields: [
      { field: 'scoring_play_id', type: 'number', nullable: false, key: 'PK', example: '12345', description: 'Auto-increment ID' },
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772941', description: 'Game reference' },
      { field: 'quarter', type: 'number', nullable: false, example: '2', description: 'Quarter (1-4, 5=OT)' },
      { field: 'time_remaining_seconds', type: 'number', nullable: true, example: '420', description: 'Time remaining' },
      { field: 'description', type: 'string', nullable: false, example: 'P.Mahomes 15 yd pass to T.Kelce', description: 'Play description' },
      { field: 'points', type: 'number', nullable: false, example: '6', description: 'Points scored' },
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Scoring team' },
    ],
  },
  {
    title: 'Player Stats - Passing',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    fields: [
      { field: 'player_id', type: 'string', nullable: false, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'passing_attempts', type: 'number', nullable: true, example: '35', description: 'Pass attempts' },
      { field: 'passing_completions', type: 'number', nullable: true, example: '24', description: 'Completions' },
      { field: 'passing_yards', type: 'number', nullable: true, example: '285', description: 'Passing yards' },
      { field: 'passing_touchdowns', type: 'number', nullable: true, example: '3', description: 'Passing TDs' },
      { field: 'passing_interceptions', type: 'number', nullable: true, example: '0', description: 'Interceptions' },
      { field: 'passing_sacks', type: 'number', nullable: true, example: '2', description: 'Times sacked' },
      { field: 'passer_rating', type: 'number', nullable: true, example: '118.5', description: 'Passer rating' },
      { field: 'qbr', type: 'number', nullable: true, example: '72.3', description: 'ESPN QBR' },
    ],
  },
  {
    title: 'Player Stats - Rushing',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    fields: [
      { field: 'rushing_attempts', type: 'number', nullable: true, example: '18', description: 'Rush attempts' },
      { field: 'rushing_yards', type: 'number', nullable: true, example: '95', description: 'Rushing yards' },
      { field: 'rushing_touchdowns', type: 'number', nullable: true, example: '1', description: 'Rushing TDs' },
      { field: 'rushing_longest', type: 'number', nullable: true, example: '32', description: 'Longest rush' },
      { field: 'rushing_fumbles', type: 'number', nullable: true, example: '0', description: 'Fumbles' },
      { field: 'rushing_fumbles_lost', type: 'number', nullable: true, example: '0', description: 'Fumbles lost' },
    ],
  },
  {
    title: 'Player Stats - Receiving',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    fields: [
      { field: 'receiving_targets', type: 'number', nullable: true, example: '8', description: 'Targets' },
      { field: 'receptions', type: 'number', nullable: true, example: '6', description: 'Receptions' },
      { field: 'receiving_yards', type: 'number', nullable: true, example: '78', description: 'Receiving yards' },
      { field: 'receiving_touchdowns', type: 'number', nullable: true, example: '1', description: 'Receiving TDs' },
      { field: 'receiving_longest', type: 'number', nullable: true, example: '28', description: 'Longest reception' },
      { field: 'receiving_yards_after_catch', type: 'number', nullable: true, example: '32', description: 'YAC' },
    ],
  },
  {
    title: 'Player Stats - Defense',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    fields: [
      { field: 'tackles_total', type: 'number', nullable: true, example: '8', description: 'Total tackles' },
      { field: 'tackles_solo', type: 'number', nullable: true, example: '5', description: 'Solo tackles' },
      { field: 'tackles_assists', type: 'number', nullable: true, example: '3', description: 'Assisted tackles' },
      { field: 'sacks', type: 'number', nullable: true, example: '1.5', description: 'Sacks' },
      { field: 'interceptions', type: 'number', nullable: true, example: '1', description: 'INTs' },
      { field: 'passes_defended', type: 'number', nullable: true, example: '2', description: 'PDs' },
      { field: 'forced_fumbles', type: 'number', nullable: true, example: '1', description: 'Forced fumbles' },
    ],
  },
  {
    title: 'Player Stats - Kicking',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    displayFormat: 'Kicking tab in PlayerStatsCard showing FG breakdown by distance (0-39, 40-49, 50+)',
    fields: [
      { field: 'field_goals_made', type: 'number', nullable: true, example: '3', description: 'Total FG made' },
      { field: 'field_goals_attempted', type: 'number', nullable: true, example: '4', description: 'Total FG attempted' },
      { field: 'field_goals_0_39', type: 'number', nullable: true, example: '2', description: 'FG made 0-39 yards' },
      { field: 'field_goals_40_49', type: 'number', nullable: true, example: '1', description: 'FG made 40-49 yards' },
      { field: 'field_goals_50_plus', type: 'number', nullable: true, example: '0', description: 'FG made 50+ yards' },
      { field: 'field_goals_longest', type: 'number', nullable: true, example: '47', description: 'Longest FG made' },
      { field: 'extra_points_made', type: 'number', nullable: true, example: '4', description: 'XP made' },
      { field: 'extra_points_attempted', type: 'number', nullable: true, example: '4', description: 'XP attempted' },
    ],
  },
  {
    title: 'Snap Counts',
    table: 'snap_counts',
    dataType: 'table',
    scraper: 'snap-counts',
    schedule: 'Weekly Tue 7AM',
    source: 'nflverse',
    primaryKey: '(player_id, season, week)',
    recordCount: '~10,000/season',
    fields: [
      { field: 'player_id', type: 'string', nullable: true, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'offense_snaps', type: 'number', nullable: true, example: '65', description: 'Offensive snaps' },
      { field: 'offense_pct', type: 'number', nullable: true, example: '0.92', description: 'Offensive snap % (0-1 scale, multiply ×100 for display)' },
      { field: 'defense_snaps', type: 'number', nullable: true, example: '0', description: 'Defensive snaps' },
      { field: 'defense_pct', type: 'number', nullable: true, example: '0.00', description: 'Defensive snap % (0-1 scale)' },
      { field: 'st_snaps', type: 'number', nullable: true, example: '5', description: 'Special teams snaps' },
      { field: 'st_pct', type: 'number', nullable: true, example: '0.19', description: 'ST snap % (0-1 scale)' },
    ],
  },
  {
    title: 'Game Day Depth Chart',
    table: 'game_rosters',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(game_id, team_id, player_id)',
    recordCount: '~13,700',
    displayFormat: 'Depth chart by unit (Offense/Defense/ST). 3 sections: Played (~47) - depth chart grouped by position, DNP (~10-17) - dressed but did not play, Inactive (~3-7) - declared inactive. Format: "QB  #9 J. Goff • #19 N. Sudfeld".',
    fields: [
      { field: 'game_roster_id', type: 'number', nullable: false, key: 'PK', example: '12345', description: 'Auto-increment ID' },
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: '401772941', description: 'Game reference (numeric, no espn- prefix)' },
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Team reference' },
      { field: 'player_id', type: 'string', nullable: false, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'position', type: 'string', nullable: true, example: 'QB', description: 'Position played (grouped by unit)' },
      { field: 'jersey_number', type: 'number', nullable: true, example: '15', description: 'Jersey number (displayed as #15)' },
      { field: 'active', type: 'boolean', nullable: false, example: 'true', description: 'Dressed for game (not declared inactive)' },
      { field: 'played', type: 'boolean', nullable: false, example: 'true', description: 'Actually got on field (had stats). ESPN entry.valid field.' },
      { field: 'status', type: 'enum', nullable: true, example: 'active', description: 'active | inactive | injured_reserve' },
      { field: 'player.full_name', type: 'string', nullable: true, example: 'Patrick Mahomes', description: 'Joined from players table, displayed as "P. Mahomes"' },
    ],
  },
  {
    title: 'NGS Passing',
    table: 'ngs_passing',
    dataType: 'table',
    scraper: 'ngs-passing',
    schedule: 'Weekly Tue 9AM',
    source: 'nflverse',
    primaryKey: '(player_id, season, week)',
    recordCount: '~700/season',
    fields: [
      { field: 'avg_time_to_throw', type: 'number', nullable: true, example: '2.65', description: 'Avg time to throw (sec)' },
      { field: 'avg_completed_air_yards', type: 'number', nullable: true, example: '5.8', description: 'Avg completed air yards' },
      { field: 'aggressiveness', type: 'number', nullable: true, example: '18.5', description: 'Aggressiveness %' },
      { field: 'completion_percentage_above_expectation', type: 'number', nullable: true, example: '3.2', description: 'CPOE' },
      { field: 'passer_rating', type: 'number', nullable: true, example: '105.3', description: 'NGS passer rating' },
    ],
  },
  {
    title: 'NGS Rushing',
    table: 'ngs_rushing',
    dataType: 'table',
    scraper: 'ngs-rushing',
    schedule: 'Weekly Tue 9AM',
    source: 'nflverse',
    primaryKey: '(player_id, season, week)',
    recordCount: '~1,400/season',
    fields: [
      { field: 'efficiency', type: 'number', nullable: true, example: '4.85', description: 'Rush efficiency' },
      { field: 'avg_time_to_los', type: 'number', nullable: true, example: '2.12', description: 'Avg time to LOS' },
      { field: 'rush_yards_over_expected', type: 'number', nullable: true, example: '15.3', description: 'RYOE' },
      { field: 'rush_yards_over_expected_per_att', type: 'number', nullable: true, example: '0.85', description: 'RYOE/att' },
      { field: 'percent_attempts_gte_eight_defenders', type: 'number', nullable: true, example: '22.5', description: '8+ box %' },
    ],
  },
  {
    title: 'NGS Receiving',
    table: 'ngs_receiving',
    dataType: 'table',
    scraper: 'ngs-receiving',
    schedule: 'Weekly Tue 9AM',
    source: 'nflverse',
    primaryKey: '(player_id, season, week)',
    recordCount: '~2,800/season',
    fields: [
      { field: 'avg_cushion', type: 'number', nullable: true, example: '6.2', description: 'Avg cushion at snap' },
      { field: 'avg_separation', type: 'number', nullable: true, example: '2.8', description: 'Avg separation at catch' },
      { field: 'avg_intended_air_yards', type: 'number', nullable: true, example: '9.5', description: 'Avg intended air yards' },
      { field: 'catch_percentage', type: 'number', nullable: true, example: '72.5', description: 'Catch %' },
      { field: 'avg_yac', type: 'number', nullable: true, example: '4.2', description: 'Avg YAC' },
      { field: 'avg_yac_above_expectation', type: 'number', nullable: true, example: '1.3', description: 'YAC above expected' },
    ],
  },
  {
    title: 'Advanced Stats',
    table: 'player_stats_advanced',
    dataType: 'table',
    scraper: 'player-stats',
    schedule: 'Weekly Tue 8AM',
    source: 'nflverse',
    primaryKey: '(player_id, season, week)',
    recordCount: '~5,000/season',
    fields: [
      { field: 'target_share', type: 'number', nullable: true, example: '0.24', description: 'Team target share' },
      { field: 'air_yards_share', type: 'number', nullable: true, example: '0.32', description: 'Air yards share' },
      { field: 'wopr', type: 'number', nullable: true, example: '0.48', description: 'Weighted Opportunity Rating' },
      { field: 'racr', type: 'number', nullable: true, example: '1.15', description: 'Receiver Air Conversion Ratio' },
      { field: 'adot', type: 'number', nullable: true, example: '8.5', description: 'Average Depth of Target' },
    ],
  },
  {
    title: 'Top EPA Plays',
    table: 'play_by_play',
    dataType: 'table',
    scraper: 'analytics',
    schedule: 'Weekly Tue 6AM',
    source: 'nflverse',
    primaryKey: '(play_id, season)',
    recordCount: '~40,000/season',
    fields: [
      { field: 'play_id', type: 'number', nullable: false, key: 'PK', example: '12345678', description: 'Play identifier' },
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', example: '2024_07_PIT_CIN', description: 'nflverse game ID' },
      { field: 'play_description', type: 'string', nullable: true, example: '(12:45) P.Mahomes pass deep...', description: 'Play description' },
      { field: 'epa', type: 'number', nullable: true, example: '4.25', description: 'Expected Points Added' },
      { field: 'wpa', type: 'number', nullable: true, example: '0.12', description: 'Win Probability Added' },
      { field: 'yards_gained', type: 'number', nullable: true, example: '45', description: 'Yards gained' },
      { field: 'play_type', type: 'string', nullable: true, example: 'pass', description: 'Play type' },
      { field: 'success', type: 'boolean', nullable: true, example: 'true', description: 'Successful play' },
    ],
  },
  // =============================================================================
  // GAME DETAILS ENHANCEMENTS (WO-GAME-DETAILS-UI-001)
  // =============================================================================
  {
    title: 'Game Officials',
    table: 'game_officials',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(game_id, position)',
    recordCount: '7/game (2025: full, 2024: ~30% - ESPN partial historical data)',
    displayFormat: 'Two-column grid sorted by position order: Referee, Umpire, Down Judge, Line Judge, Field Judge, Side Judge, Back Judge',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772947', description: 'Game reference' },
      { field: 'position', type: 'string', nullable: false, example: 'Referee', description: 'Official position' },
      { field: 'official_name', type: 'string', nullable: false, example: 'Brad Allen', description: 'Official full name' },
    ],
  },
  {
    title: 'Coin Toss',
    table: 'games',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete (NOT YET IMPLEMENTED)',
    source: 'ESPN API',
    primaryKey: '(game_id, season)',
    recordCount: 'Not scraped yet',
    displayFormat: 'Shows winning team with badge and their decision (Receive/Defer/Kick)',
    fields: [
      { field: 'coin_toss_winner_team_id', type: 'string', nullable: true, key: 'FK', fkRef: 'teams.team_id', example: 'DET', description: 'Team that won the toss (not yet scraped)' },
      { field: 'coin_toss_decision', type: 'enum', nullable: true, example: 'receive', description: 'receive | defer | kick (not yet scraped)' },
    ],
  },
  {
    title: 'Game Recap',
    table: 'game_recaps',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: 'game_id',
    recordCount: '~272/season',
    displayFormat: 'Card with headline (bold) and summary text, plus published timestamp',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'PK', example: 'espn-401772947', description: 'Game reference' },
      { field: 'headline', type: 'string', nullable: true, example: 'Jahmyr Gibbs rushes for 3 TDs...', description: 'Article headline' },
      { field: 'summary', type: 'string', nullable: true, example: 'The Lions dominated...', description: 'Article summary' },
      { field: 'published_at', type: 'date', nullable: true, example: '2025-12-08T23:45:00Z', description: 'Publication timestamp' },
    ],
  },
  {
    title: 'Head to Head',
    table: 'game_head_to_head',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete (NOT YET IMPLEMENTED)',
    source: 'ESPN API',
    primaryKey: 'game_id',
    recordCount: 'Table not created',
    displayFormat: 'Shows all-time record (W-L-T), series leader badge, current streak, and last meeting date/winner',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'PK', example: 'espn-401772947', description: 'Game reference' },
      { field: 'home_all_time_wins', type: 'number', nullable: false, example: '45', description: 'Home team all-time wins vs opponent (planned)' },
      { field: 'away_all_time_wins', type: 'number', nullable: false, example: '38', description: 'Away team all-time wins vs opponent (planned)' },
      { field: 'all_time_ties', type: 'number', nullable: false, example: '2', description: 'All-time ties (planned)' },
      { field: 'current_streak_team_id', type: 'string', nullable: true, key: 'FK', fkRef: 'teams.team_id', example: 'DET', description: 'Team on current streak (planned)' },
      { field: 'current_streak_count', type: 'number', nullable: false, example: '3', description: 'Current win streak count (planned)' },
      { field: 'last_meeting_date', type: 'date', nullable: true, example: '2024-12-15', description: 'Date of last matchup (planned)' },
      { field: 'last_meeting_winner_team_id', type: 'string', nullable: true, key: 'FK', fkRef: 'teams.team_id', example: 'DAL', description: 'Winner of last meeting (planned)' },
    ],
  },
  {
    title: 'Player Stats - Returns',
    table: 'player_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(player_id, game_id, season)',
    recordCount: '~6,800/season',
    displayFormat: 'Returns tab in PlayerStatsCard showing KR and PR columns',
    fields: [
      { field: 'kick_return_attempts', type: 'number', nullable: true, example: '3', description: 'Kick return attempts' },
      { field: 'kick_return_yards', type: 'number', nullable: true, example: '72', description: 'Kick return yards' },
      { field: 'kick_return_avg', type: 'number', nullable: true, example: '24.0', description: 'Kick return average' },
      { field: 'kick_return_long', type: 'number', nullable: true, example: '35', description: 'Longest kick return' },
      { field: 'kick_return_tds', type: 'number', nullable: true, example: '0', description: 'Kick return TDs' },
      { field: 'punt_return_attempts', type: 'number', nullable: true, example: '2', description: 'Punt return attempts' },
      { field: 'punt_return_yards_total', type: 'number', nullable: true, example: '18', description: 'Punt return yards' },
      { field: 'punt_return_avg', type: 'number', nullable: true, example: '9.0', description: 'Punt return average' },
      { field: 'punt_return_long', type: 'number', nullable: true, example: '12', description: 'Longest punt return' },
      { field: 'punt_return_tds', type: 'number', nullable: true, example: '0', description: 'Punt return TDs' },
    ],
  },
  {
    title: 'Team Stats - First Down Breakdown',
    table: 'team_game_stats',
    dataType: 'table',
    scraper: 'game-stats',
    schedule: 'On game complete',
    source: 'ESPN API',
    primaryKey: '(team_id, game_id)',
    recordCount: '~544/season',
    displayFormat: 'Conditional rows in TeamStatsCard showing Passing 1st, Rushing 1st, Penalty 1st',
    fields: [
      { field: 'first_downs', type: 'number', nullable: true, example: '22', description: 'Total first downs' },
      { field: 'passing_first_downs', type: 'number', nullable: true, example: '12', description: 'First downs via passing' },
      { field: 'rushing_first_downs', type: 'number', nullable: true, example: '8', description: 'First downs via rushing' },
      { field: 'penalty_first_downs', type: 'number', nullable: true, example: '2', description: 'First downs via penalty' },
    ],
  },
  {
    title: 'Game Videos',
    table: 'game_videos',
    dataType: 'table',
    scraper: 'video-scraper',
    schedule: 'Daily (YouTube search)',
    source: 'ESPN API',
    primaryKey: '(game_id, video_type)',
    recordCount: '~500+ (2025: 174, 2024: 47+ backfilled)',
    displayFormat: 'VideoCard showing highlight thumbnails with YouTube links',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772891', description: 'Game reference' },
      { field: 'video_type', type: 'enum', nullable: false, example: 'highlights', description: 'highlights | condensed_game | full_game | key_plays' },
      { field: 'youtube_id', type: 'string', nullable: false, example: 'dQw4w9WgXcQ', description: 'YouTube video ID' },
      { field: 'title', type: 'string', nullable: false, example: 'Green Bay Packers vs. Detroit Lions Game Highlights', description: 'Video title' },
      { field: 'thumbnail_url', type: 'string', nullable: true, example: 'https://i.ytimg.com/vi/...', description: 'Video thumbnail URL' },
      { field: 'duration_seconds', type: 'number', nullable: true, example: '720', description: 'Video duration in seconds' },
      { field: 'scraped_at', type: 'date', nullable: false, example: '2025-12-15T12:00:00Z', description: 'When video was scraped' },
    ],
  },
  {
    title: 'Win Probability',
    table: 'win_probability',
    dataType: 'table',
    scraper: 'live-games',
    schedule: 'Real-time during live games',
    source: 'ESPN API',
    primaryKey: '(game_id, sequence_number)',
    recordCount: '~150-200 per game (live games only)',
    displayFormat: 'WinProbabilityChart showing home/away probability over time',
    fields: [
      { field: 'game_id', type: 'string', nullable: false, key: 'FK', fkRef: 'games.game_id', example: 'espn-401772891', description: 'Game reference' },
      { field: 'sequence_number', type: 'number', nullable: false, example: '45', description: 'Play sequence number' },
      { field: 'home_win_probability', type: 'number', nullable: true, example: '0.72', description: 'Home team win probability (0-1)' },
      { field: 'away_win_probability', type: 'number', nullable: true, example: '0.28', description: 'Away team win probability (0-1)' },
      { field: 'play_description', type: 'string', nullable: true, example: 'P.Mahomes pass to T.Kelce for 15 yards', description: 'Play that caused probability change' },
      { field: 'created_at', type: 'date', nullable: false, example: '2025-12-15T20:45:00Z', description: 'When probability was recorded' },
    ],
  },
]

// =============================================================================
// STANDINGS TAB DATA
// =============================================================================

export const STANDINGS_SECTIONS: SectionDefinition[] = [
  {
    title: 'Team Season Stats',
    table: 'team_season_stats',
    dataType: 'table',
    scraper: 'standings',
    schedule: 'Daily 7AM',
    source: 'Database',
    primaryKey: '(team_id, season)',
    recordCount: '32/season',
    fields: [
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Team reference' },
      { field: 'season', type: 'number', nullable: false, key: 'PK', example: '2025', description: 'Season year' },
      { field: 'wins', type: 'number', nullable: false, example: '5', description: 'Win count' },
      { field: 'losses', type: 'number', nullable: false, example: '2', description: 'Loss count' },
      { field: 'ties', type: 'number', nullable: false, example: '0', description: 'Tie count' },
      { field: 'win_percentage', type: 'number', nullable: false, example: '0.714', description: 'Win % (0.000-1.000)' },
      { field: 'points_for', type: 'number', nullable: false, example: '187', description: 'Total points scored' },
      { field: 'points_against', type: 'number', nullable: false, example: '142', description: 'Total points allowed' },
      { field: 'point_differential', type: 'number', nullable: false, example: '+45', description: 'PF - PA' },
      { field: 'division_rank', type: 'number', nullable: true, example: '1', description: 'Division rank (1-4)' },
      { field: 'conference_rank', type: 'number', nullable: true, example: '2', description: 'Conference rank (1-16)' },
    ],
  },
]

// =============================================================================
// INJURIES TAB DATA
// =============================================================================

export const INJURIES_SECTIONS: SectionDefinition[] = [
  {
    title: 'Player Injuries',
    table: 'player_injuries',
    dataType: 'table',
    scraper: 'roster-updates',
    schedule: 'Daily',
    source: 'ESPN API',
    primaryKey: 'injury_id',
    recordCount: '~500+/season',
    displayFormat: 'Grouped by injury type with color-coded badges. Shows player name, position, description, dates, and games missed.',
    fields: [
      { field: 'injury_id', type: 'number', nullable: false, key: 'PK', example: '12345', description: 'Auto-increment ID' },
      { field: 'player_id', type: 'string', nullable: false, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'season', type: 'number', nullable: false, example: '2025', description: 'Season year' },
      { field: 'injury_type', type: 'string', nullable: true, example: 'Knee', description: 'Type of injury (Knee, Ankle, Concussion, etc.)' },
      { field: 'injury_description', type: 'string', nullable: true, example: 'ACL tear, out for season', description: 'Detailed injury description' },
      { field: 'injury_date', type: 'date', nullable: true, example: '2025-10-15', description: 'Date injury occurred' },
      { field: 'return_date', type: 'date', nullable: true, example: '2025-11-20', description: 'Date player returned (if applicable)' },
      { field: 'games_missed', type: 'number', nullable: false, example: '4', description: 'Number of games missed' },
      { field: 'created_at', type: 'date', nullable: false, example: '2025-10-15T12:00:00Z', description: 'Record creation timestamp' },
      { field: 'updated_at', type: 'date', nullable: false, example: '2025-10-15T12:00:00Z', description: 'Record update timestamp' },
    ],
  },
  {
    title: 'Player Info (Joined)',
    table: 'players',
    dataType: 'table',
    scraper: 'roster-updates',
    schedule: 'Daily',
    source: 'ESPN API',
    primaryKey: 'player_id',
    recordCount: '~2,500',
    fields: [
      { field: 'player_id', type: 'string', nullable: false, key: 'PK', example: 'espn-3139477', description: 'ESPN player ID' },
      { field: 'full_name', type: 'string', nullable: false, example: 'Patrick Mahomes', description: 'Player full name' },
      { field: 'primary_position', type: 'string', nullable: true, example: 'QB', description: 'Primary position' },
      { field: 'current_team_id', type: 'string', nullable: true, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Current team' },
    ],
  },
]

// =============================================================================
// TRANSACTIONS TAB DATA
// =============================================================================

export const TRANSACTIONS_SECTIONS: SectionDefinition[] = [
  {
    title: 'Roster Transactions',
    table: 'roster_transactions',
    dataType: 'table',
    scraper: 'roster-updates',
    schedule: 'Daily',
    source: 'ESPN API',
    primaryKey: 'transaction_id',
    recordCount: '~1,000+/season',
    displayFormat: 'Grouped by date, showing transaction type badges (Signed=green, Released=red, Traded=blue, Waived=orange, Claimed=purple)',
    fields: [
      { field: 'transaction_id', type: 'number', nullable: false, key: 'PK', example: '12345', description: 'Auto-increment ID' },
      { field: 'player_id', type: 'string', nullable: false, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Team reference' },
      { field: 'transaction_type', type: 'enum', nullable: false, example: 'signed', description: 'signed | released | traded | waived | claimed' },
      { field: 'transaction_date', type: 'date', nullable: false, example: '2025-10-15', description: 'Date of transaction' },
      { field: 'details', type: 'string', nullable: true, example: 'Signed to practice squad', description: 'Transaction details' },
      { field: 'created_at', type: 'date', nullable: false, example: '2025-10-15T12:00:00Z', description: 'Record creation timestamp' },
      { field: 'updated_at', type: 'date', nullable: false, example: '2025-10-15T12:00:00Z', description: 'Record update timestamp' },
    ],
  },
  {
    title: 'Player Info (Joined)',
    table: 'players',
    dataType: 'table',
    scraper: 'roster-updates',
    schedule: 'Daily',
    source: 'ESPN API',
    primaryKey: 'player_id',
    recordCount: '~2,500',
    fields: [
      { field: 'player_id', type: 'string', nullable: false, key: 'PK', example: 'espn-3139477', description: 'ESPN player ID' },
      { field: 'full_name', type: 'string', nullable: false, example: 'Patrick Mahomes', description: 'Player full name' },
      { field: 'primary_position', type: 'string', nullable: true, example: 'QB', description: 'Primary position' },
    ],
  },
  {
    title: 'Team Info (Joined)',
    table: 'teams',
    dataType: 'table',
    scraper: 'seed',
    schedule: 'One-time seed',
    source: 'ESPN API',
    primaryKey: 'team_id',
    recordCount: '32 teams',
    fields: [
      { field: 'team_id', type: 'string', nullable: false, key: 'PK', example: 'KC', description: 'Team code' },
      { field: 'team_name', type: 'string', nullable: false, example: 'Kansas City Chiefs', description: 'Full team name' },
      { field: 'team_abbr', type: 'string', nullable: false, example: 'KC', description: 'Team abbreviation' },
      { field: 'logo_url', type: 'string', nullable: true, example: 'https://a.espncdn.com/...', description: 'Team logo URL' },
    ],
  },
]

// =============================================================================
// TEAMS TAB DATA
// =============================================================================

export const TEAMS_SECTIONS: SectionDefinition[] = [
  {
    title: 'Team Directory',
    table: 'teams',
    dataType: 'table',
    scraper: 'seed',
    schedule: 'One-time seed',
    source: 'ESPN API',
    primaryKey: 'team_id',
    recordCount: '32 teams',
    displayFormat: 'Grid grouped by division (AFC/NFC East/North/South/West)',
    fields: [
      { field: 'team_id', type: 'string', nullable: false, key: 'PK', example: 'KC', description: '2-3 letter team code' },
      { field: 'team_name', type: 'string', nullable: false, example: 'Kansas City Chiefs', description: 'Full team name' },
      { field: 'team_abbr', type: 'string', nullable: false, example: 'KC', description: 'Team abbreviation' },
      { field: 'city', type: 'string', nullable: true, example: 'Kansas City', description: 'Team city' },
      { field: 'nickname', type: 'string', nullable: true, example: 'Chiefs', description: 'Team nickname' },
      { field: 'conference', type: 'enum', nullable: true, example: 'AFC', description: 'AFC | NFC' },
      { field: 'division', type: 'enum', nullable: true, example: 'West', description: 'North | South | East | West' },
      { field: 'logo_url', type: 'string', nullable: true, example: 'https://a.espncdn.com/...', description: 'Team logo URL' },
    ],
  },
  {
    title: 'Team Transactions',
    table: 'roster_transactions',
    dataType: 'table',
    scraper: 'roster-updates',
    schedule: 'Daily',
    source: 'ESPN API',
    primaryKey: 'transaction_id',
    recordCount: '~1,000+/season',
    displayFormat: 'Filtered by team_id, sorted by date descending',
    fields: [
      { field: 'transaction_id', type: 'number', nullable: false, key: 'PK', example: '12345', description: 'Auto-increment ID' },
      { field: 'player_id', type: 'string', nullable: false, key: 'FK', fkRef: 'players.player_id', example: 'espn-3139477', description: 'Player reference' },
      { field: 'team_id', type: 'string', nullable: false, key: 'FK', fkRef: 'teams.team_id', example: 'KC', description: 'Team reference (filter key)' },
      { field: 'transaction_type', type: 'enum', nullable: false, example: 'signed', description: 'signed | released | traded | waived | claimed' },
      { field: 'transaction_date', type: 'date', nullable: false, example: '2025-10-15', description: 'Date of transaction' },
      { field: 'details', type: 'string', nullable: true, example: 'Signed to practice squad', description: 'Transaction details' },
    ],
  },
]

// =============================================================================
// SUMMARY STATS
// =============================================================================

export function getTotalFields(): { scoreboard: number; gameDetails: number; standings: number; injuries: number; transactions: number; teams: number; total: number } {
  const scoreboard = SCOREBOARD_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  const gameDetails = GAME_DETAILS_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  const standings = STANDINGS_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  const injuries = INJURIES_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  const transactions = TRANSACTIONS_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  const teams = TEAMS_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)
  return {
    scoreboard,
    gameDetails,
    standings,
    injuries,
    transactions,
    teams,
    total: scoreboard + gameDetails + standings + injuries + transactions + teams,
  }
}

export function getUniqueTables(): string[] {
  const tables = new Set<string>()
  ;[...SCOREBOARD_SECTIONS, ...GAME_DETAILS_SECTIONS, ...STANDINGS_SECTIONS, ...INJURIES_SECTIONS, ...TRANSACTIONS_SECTIONS, ...TEAMS_SECTIONS].forEach(s => {
    if (s.table !== 'client') tables.add(s.table)
  })
  return Array.from(tables)
}

export function getUniqueSources(): string[] {
  const sources = new Set<string>()
  ;[...SCOREBOARD_SECTIONS, ...GAME_DETAILS_SECTIONS, ...STANDINGS_SECTIONS, ...INJURIES_SECTIONS, ...TRANSACTIONS_SECTIONS, ...TEAMS_SECTIONS].forEach(s => {
    sources.add(s.source)
  })
  return Array.from(sources)
}

export const SUMMARY = {
  totalFields: getTotalFields().total,
  tables: getUniqueTables().length,
  scrapers: 12,
  sources: getUniqueSources().length,
}
