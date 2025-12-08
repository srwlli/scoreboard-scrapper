/**
 * NFL Stats App - TypeScript Interface Reference
 *
 * Total: 15 interfaces covering 146 data fields across 13 database tables
 */

// ============================================================================
// CORE GAME DATA (ESPN game_id format)
// ============================================================================

/**
 * Main game record from `games` table
 * Primary key: game_id (ESPN format: "espn-401772510")
 */
export interface Game {
  game_id: string
  season: number
  week: number
  game_date: string
  game_time: string | null
  status: 'scheduled' | 'in_progress' | 'final'

  // Team references
  home_team_id: string
  away_team_id: string

  // Final scores
  home_score: number | null
  away_score: number | null

  // Quarter-by-quarter scores
  home_q1_score: number | null
  home_q2_score: number | null
  home_q3_score: number | null
  home_q4_score: number | null
  home_ot_score: number | null
  away_q1_score: number | null
  away_q2_score: number | null
  away_q3_score: number | null
  away_q4_score: number | null
  away_ot_score: number | null

  // Venue & broadcast
  stadium_id: string | null
  broadcast_network: string | null
  attendance: number | null
  overtime: boolean
  duration_minutes: number | null

  // Coin Toss (WO-GAME-DETAILS-UI-001)
  coin_toss_winner_team_id: string | null
  coin_toss_decision: string | null  // 'receive', 'defer', 'kick'

  // Live game state (populated during in_progress games)
  game_clock: string | null
  current_period: number | null
  possession_team_id: string | null
  current_down: number | null
  yards_to_go: number | null
  field_position: string | null
  last_play_text: string | null
  home_win_probability: number | null
  away_win_probability: number | null
  live_updated_at: string | null

  // Joined relations
  home_team?: Team
  away_team?: Team
  stadium?: Stadium
}

/**
 * Team record from `teams` table
 */
export interface Team {
  team_id: string
  team_name: string
  team_abbr: string
  city: string | null
  nickname: string | null
  conference: 'AFC' | 'NFC' | null
  division: 'North' | 'South' | 'East' | 'West' | null
  logo_url: string | null
}

/**
 * Stadium record from `stadiums` table
 */
export interface Stadium {
  stadium_id: string
  stadium_name: string
  city: string
  state: string | null
  country: string
  capacity: number
  surface_type: string
  roof_type: 'Open' | 'Retractable' | 'Dome'
  latitude: number | null
  longitude: number | null
  elevation_feet: number | null
  opened_year: number | null
}

/**
 * Weather record from `game_weather` table
 */
export interface GameWeather {
  game_id: string
  season: number
  week: number
  temperature_fahrenheit: number
  humidity_percentage: number
  wind_speed_mph: number
  wind_direction: string
  conditions: string
  precipitation: string
}

// ============================================================================
// TEAM & PLAYER STATS (ESPN game_id format)
// ============================================================================

/**
 * Team game stats from `team_game_stats` table
 */
export interface TeamGameStats {
  id: number
  game_id: string
  season: number
  week: number
  team_id: string
  opponent_team_id: string
  is_home: boolean

  // Scoring
  points_scored: number
  points_allowed: number

  // Yardage
  total_yards: number
  passing_yards: number
  rushing_yards: number

  // Turnovers
  turnovers: number
  turnovers_forced: number

  // Possession
  time_of_possession_seconds: number

  // Efficiency
  first_downs: number
  third_down_conversions: number
  third_down_attempts: number
  fourth_down_conversions: number
  fourth_down_attempts: number
  red_zone_attempts: number
  red_zone_scores: number

  // Penalties
  penalties: number
  penalty_yards: number
  sacks_allowed: number

  // First Down Breakdown (WO-GAME-DETAILS-UI-001)
  passing_first_downs: number
  rushing_first_downs: number
  penalty_first_downs: number
}

/**
 * Player game stats from `player_game_stats` table
 */
export interface PlayerGameStats {
  player_game_id: number
  player_id: string
  game_id: string
  season: number
  week: number
  team_id: string
  opponent_team_id: string
  started: boolean | null

  // PASSING
  passing_attempts: number
  passing_completions: number
  passing_yards: number
  passing_touchdowns: number
  passing_interceptions: number
  passing_sacks: number
  passing_sack_yards_lost: number
  passing_longest: number
  passer_rating: number | null
  qbr: number | null

  // RUSHING
  rushing_attempts: number
  rushing_yards: number
  rushing_touchdowns: number
  rushing_longest: number
  rushing_fumbles: number
  rushing_fumbles_lost: number
  rushing_first_downs: number
  rushing_yards_after_contact: number

  // RECEIVING
  receptions: number
  receiving_targets: number
  receiving_yards: number
  receiving_touchdowns: number
  receiving_longest: number
  receiving_yards_after_catch: number
  receiving_first_downs: number
  receiving_fumbles: number
  receiving_fumbles_lost: number
  receiving_drops: number

  // DEFENSE
  tackles_total: number
  tackles_solo: number
  tackles_assists: number
  tackles_for_loss: number
  sacks: number
  sack_yards: number
  qb_hits: number
  interceptions: number
  interception_yards: number
  interception_touchdowns: number
  passes_defended: number
  forced_fumbles: number
  fumble_recoveries: number

  // KICKING
  field_goals_made: number
  field_goals_attempted: number
  field_goal_longest: number
  field_goals_0_39: string | null
  field_goals_40_49: string | null
  field_goals_50_plus: string | null
  extra_points_made: number
  extra_points_attempted: number

  // PUNTING
  punts: number
  punt_yards: number
  punt_average: number
  punt_longest: number
  punts_inside_20: number
  punt_touchbacks: number
  punt_fair_catches: number
  punt_return_yards: number

  // KICK RETURNS (WO-GAME-DETAILS-UI-001)
  kick_return_attempts: number
  kick_return_yards: number
  kick_return_avg: number | null
  kick_return_long: number
  kick_return_tds: number

  // PUNT RETURNS (WO-GAME-DETAILS-UI-001)
  punt_return_attempts: number
  punt_return_yards_total: number
  punt_return_avg: number | null
  punt_return_long: number
  punt_return_tds: number

  // FANTASY
  fantasy_points_standard: number | null
  fantasy_points_ppr: number | null
  fantasy_points_half_ppr: number | null
  fantasy_points_dfs_dk: number | null
  fantasy_points_dfs_fd: number | null

  // Joined relation
  player?: Player
}

/**
 * Player record from `players` table
 */
export interface Player {
  player_id: string
  full_name: string
  first_name: string | null
  last_name: string | null
  primary_position: string | null
  jersey_number: number | null
  height_inches: number | null
  weight_pounds: number | null
  birth_date: string | null
  college: string | null
  draft_year: number | null
  draft_round: number | null
  draft_pick: number | null
  current_team_id: string | null
  status: string | null
}

/**
 * Scoring play from `scoring_plays` table
 */
export interface ScoringPlay {
  scoring_play_id: number
  game_id: string
  season: number
  quarter: number
  time_remaining_seconds: number
  team_id: string
  scoring_type: string
  points: number
  description: string
  home_score: number | null
  away_score: number | null
}

// ============================================================================
// NFLVERSE DATA (nflverse game_id format: "2025_01_BAL_KC")
// ============================================================================

/**
 * Snap count from `snap_counts` table
 */
export interface SnapCount {
  id: number
  game_id: string
  season: number
  week: number
  team_id: string
  player_name: string
  position: string | null

  offense_snaps: number
  offense_pct: number
  defense_snaps: number
  defense_pct: number
  st_snaps: number
  st_pct: number
}

/**
 * Play-by-play record from `play_by_play` table
 */
export interface PlayByPlay {
  play_id: string
  game_id: string
  season: number

  quarter: number
  time_remaining_seconds: number | null
  play_description: string

  possession_team_id: string | null

  play_type: string | null
  yards_gained: number

  // Situation fields
  down: number | null
  yards_to_go: number | null
  yard_line: number | null
  drive_id: string | null
  play_number: number | null

  // Analytics
  epa: number | null
  wpa: number | null
  success: boolean | null
}

// ============================================================================
// LIVE GAME DATA (from live-scraper-v2)
// ============================================================================

/**
 * Win probability data point from `win_probability` table
 * ~180+ data points per game, updated every play
 */
export interface WinProbability {
  id: number
  game_id: string
  season: number
  play_id: string | null
  sequence_number: number

  // Win probability values (0.0 to 1.0)
  home_win_pct: number
  away_win_pct: number

  // Game context at this point
  quarter: number | null
  game_clock: string | null
  home_score: number
  away_score: number

  created_at: string
}

/**
 * Live play data from `live_plays` table
 * Real-time play-by-play feed updated during live games
 */
export interface LivePlay {
  id: number
  game_id: string
  season: number
  play_id: string

  // Play sequencing
  drive_number: number | null
  play_number: number | null

  // Game context
  quarter: number | null
  game_clock: string | null
  possession_team_id: string | null

  // Situation
  down: number | null
  yards_to_go: number | null
  yard_line: number | null
  yard_line_side: string | null

  // Play result
  play_type: string | null
  play_text: string | null
  yards_gained: number | null
  is_scoring_play: boolean
  is_turnover: boolean

  // Score at time of play
  home_score: number
  away_score: number

  // Analytics (if available during live)
  epa: number | null
  win_probability: number | null

  created_at: string
  updated_at: string
}

/**
 * NGS Passing stats
 */
export interface NGSPassing {
  id: number
  season: number
  week: number
  player_id: string | null
  player_name: string
  team_id: string

  avg_time_to_throw: number
  avg_completed_air_yards: number
  avg_intended_air_yards: number
  avg_air_yards_differential: number
  avg_air_yards_to_sticks: number
  max_completed_air_distance: number

  aggressiveness: number
  completion_percentage: number
  expected_completion_percentage: number
  completion_percentage_above_expectation: number

  attempts: number
  completions: number
  passing_yards: number
  passing_touchdowns: number
  interceptions: number
  passer_rating: number
}

/**
 * NGS Rushing stats
 */
export interface NGSRushing {
  id: number
  season: number
  week: number
  player_id: string | null
  player_name: string
  team_id: string
  position: string | null

  rush_attempts: number
  rush_yards: number
  avg_rush_yards: number
  rush_touchdowns: number

  efficiency: number
  percent_attempts_gte_eight_defenders: number
  avg_time_to_los: number

  expected_rush_yards: number
  rush_yards_over_expected: number
  rush_yards_over_expected_per_att: number
  rush_pct_over_expected: number
}

/**
 * NGS Receiving stats
 */
export interface NGSReceiving {
  id: number
  season: number
  week: number
  player_id: string | null
  player_name: string
  team_id: string
  position: string | null

  targets: number
  receptions: number
  receiving_yards: number
  receiving_touchdowns: number

  avg_cushion: number
  avg_separation: number
  avg_intended_air_yards: number
  percent_share_of_intended_air_yards: number

  catch_percentage: number
  avg_yac: number
  avg_expected_yac: number
  avg_yac_above_expectation: number
}

/**
 * Advanced stats from nflverse
 */
export interface AdvancedStats {
  id: number
  season: number
  week: number
  player_id: string | null
  player_name: string
  team_id: string
  position: string | null

  target_share: number
  air_yards_share: number
  wopr: number
  racr: number
  adot: number

  pacr: number
  dakota: number

  receiving_air_yards: number
  receiving_yards_after_catch: number

  passing_2pt_conversions: number
  rushing_2pt_conversions: number
  receiving_2pt_conversions: number

  sack_fumbles: number
  sack_fumbles_lost: number
}

// ============================================================================
// GAME ROSTER DATA (ESPN game_id format)
// ============================================================================

/**
 * Game roster entry from `game_rosters` table
 * Tracks who played in each game with 3 categories:
 *   - played=true, active=true  → Actually played (got on field, ~47/team)
 *   - played=false, active=true → Dressed but DNP (~10-17/team)
 *   - active=false              → Declared inactive (~7/team)
 */
export interface GameRoster {
  game_roster_id: number
  game_id: string
  season: number
  team_id: string
  player_id: string
  position: string | null
  jersey_number: number | null
  active: boolean
  played: boolean // Actually got on the field (had stats)
  status: string | null
  // Joined relation
  player?: Player
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface GameRosterCardProps {
  rosters: GameRoster[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export interface ScoreBugProps {
  game: Pick<Game,
    'game_id' | 'game_date' | 'game_time' | 'status' | 'broadcast_network' |
    'home_score' | 'away_score' |
    'home_q1_score' | 'home_q2_score' | 'home_q3_score' | 'home_q4_score' | 'home_ot_score' |
    'away_q1_score' | 'away_q2_score' | 'away_q3_score' | 'away_q4_score' | 'away_ot_score'
  >
  homeTeam: Team
  awayTeam: Team
}

export interface VenueCardProps {
  stadium: Stadium | null
  attendance: number | null
}

export interface WeatherCardProps {
  weather: GameWeather | null
}

export interface TeamStatsCardProps {
  homeStats: TeamGameStats | null
  awayStats: TeamGameStats | null
  homeTeam: Team
  awayTeam: Team
}

export interface ScoringPlaysProps {
  plays: ScoringPlay[]
  teams: Record<string, Team>
}

export interface PlayerStatsCardProps {
  playerStats: PlayerGameStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export interface SnapCountsCardProps {
  snapCounts: SnapCount[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export interface TopEPAPlaysProps {
  plays: PlayByPlay[]
  teams: Record<string, Team>
}

export interface NGSStatsCardProps {
  passing: NGSPassing[]
  rushing: NGSRushing[]
  receiving: NGSReceiving[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export interface AdvancedStatsCardProps {
  stats: AdvancedStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export interface DataSourceFooterProps {
  totalFields?: number
  scraperCount?: number
}

export interface WinProbabilityChartProps {
  data: WinProbability[]
  homeTeam: Team
  awayTeam: Team
}

export interface LivePlaysCardProps {
  plays: LivePlay[]
  teams: Record<string, Team>
}

export interface LiveGameState {
  quarter: number | null
  gameClock: string | null
  possession: string | null
  down: number | null
  yardsToGo: number | null
  yardLine: number | null
  yardLineSide: string | null
}

// ============================================================================
// GAME DETAILS ENHANCEMENTS (WO-GAME-DETAILS-UI-001)
// ============================================================================

/**
 * Game official from `game_officials` table
 * Referee crew information for each game
 */
export interface GameOfficial {
  id: number
  game_id: string
  season: number
  position: string  // 'Referee', 'Umpire', 'Down Judge', 'Line Judge', etc.
  official_name: string
  created_at: string
  updated_at: string
}

/**
 * Game prediction from `game_predictions` table
 * ESPN pregame predictions and expert picks
 */
export interface GamePrediction {
  id: number
  game_id: string
  season: number
  source: string  // 'espn'
  home_win_probability: number | null
  away_win_probability: number | null
  predicted_winner_team_id: string | null
  expert_pick_home_pct: number | null
  expert_pick_away_pct: number | null
  created_at: string
  updated_at: string
}

/**
 * Game recap from `game_recaps` table
 * Post-game article text
 */
export interface GameRecap {
  id: number
  game_id: string
  season: number
  headline: string | null
  summary: string | null
  full_text: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Head-to-head record from `game_head_to_head` table
 * Historical matchup records between teams
 */
export interface GameHeadToHead {
  id: number
  game_id: string
  season: number
  home_team_id: string
  away_team_id: string
  home_all_time_wins: number
  away_all_time_wins: number
  all_time_ties: number
  home_home_wins: number
  away_away_wins: number
  current_streak_team_id: string | null
  current_streak_count: number
  last_meeting_date: string | null
  last_meeting_winner_team_id: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GamePageData {
  game: Game & {
    home_team: Team
    away_team: Team
    stadium: Stadium | null
  }
  teamStats: TeamGameStats[]
  playerStats: PlayerGameStats[]
  scoringPlays: ScoringPlay[]
  weather: GameWeather | null
  snapCounts: SnapCount[]
  topPlays: PlayByPlay[]
  ngsPassing: NGSPassing[]
  ngsRushing: NGSRushing[]
  ngsReceiving: NGSReceiving[]
  advancedStats: AdvancedStats[]
  nflverseGameId: string
}

/**
 * Scoreboard page types
 */
export interface ScoreboardGame extends Game {
  home_team: Team
  away_team: Team
}

export interface ScoreboardData {
  games: ScoreboardGame[]
  season: number
  week: number
}

export interface TeamScheduleGame extends ScoreboardGame {
  isHome: boolean
  opponent: Team
  result: 'W' | 'L' | 'T' | null
}

export interface TeamScheduleData {
  team: Team
  season: number
  games: TeamScheduleGame[]
  record: {
    wins: number
    losses: number
    ties: number
  }
}

// ============================================================================
// STANDINGS DATA
// ============================================================================

/**
 * Team season stats from `team_season_stats` table
 */
export interface TeamSeasonStats {
  team_id: string
  season: number
  games_played: number
  wins: number
  losses: number
  ties: number
  win_percentage: number
  points_for: number
  points_against: number
  point_differential: number
  division_rank: number
  conference_rank: number
}

/**
 * Standing with team info joined
 */
export interface TeamStanding extends TeamSeasonStats {
  team: Team
}

/**
 * Standings grouped by division
 */
export interface DivisionStandings {
  conference: 'AFC' | 'NFC'
  division: 'North' | 'South' | 'East' | 'West'
  teams: TeamStanding[]
}

/**
 * All standings data
 */
export interface StandingsData {
  season: number
  afc: DivisionStandings[]
  nfc: DivisionStandings[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function toNflverseGameId(
  season: number,
  week: number,
  awayTeamId: string,
  homeTeamId: string
): string {
  return `${season}_${String(week).padStart(2, '0')}_${awayTeamId}_${homeTeamId}`
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatPossession(seconds: number): string {
  return formatTime(seconds)
}

export function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

export function getCurrentWeek(season: number): number {
  const now = new Date()
  const seasonStart = new Date(season, 8, 5) // Sept 5
  const weeksSinceStart = Math.floor(
    (now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return Math.max(1, Math.min(18, weeksSinceStart + 1))
}

export function getGameStatusBadge(status: Game['status']): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  switch (status) {
    case 'final':
      return { label: 'Final', variant: 'secondary' }
    case 'in_progress':
      return { label: 'Live', variant: 'destructive' }
    case 'scheduled':
    default:
      return { label: 'Scheduled', variant: 'outline' }
  }
}
