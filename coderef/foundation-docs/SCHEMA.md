# Schema Reference - NFL Stats App

**Last Updated:** 2025-12-08
**Schema Version:** 1.1.0

---

## Overview

The NFL Stats App uses Supabase (PostgreSQL) with 15+ tables covering games, teams, players, and statistics from ESPN and nflverse data sources.

## TypeScript Interfaces

All types are defined in `src/types/game.ts` (684 lines, 15 interfaces, 146+ fields).

---

## Core Tables

### `games`

Main game records with ESPN game IDs.

```typescript
interface Game {
  game_id: string              // Primary key: "espn-401772510"
  season: number               // 2024
  week: number                 // 1-18
  game_date: string            // "2024-09-05"
  game_time: string | null     // "20:20:00" (UTC)
  status: 'scheduled' | 'in_progress' | 'final'

  home_team_id: string         // FK to teams
  away_team_id: string         // FK to teams

  home_score: number | null
  away_score: number | null

  // Quarter scores
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

  stadium_id: string | null    // FK to stadiums
  broadcast_network: string | null
  attendance: number | null
  overtime: boolean
  duration_minutes: number | null

  // Coin Toss (WO-GAME-DETAILS-ENHANCEMENTS-001)
  coin_toss_winner_team_id: string | null  // FK to teams
  coin_toss_decision: 'receive' | 'defer' | 'kick' | null
}
```

---

### `teams`

NFL team records.

```typescript
interface Team {
  team_id: string              // Primary key: "KC", "BAL"
  team_name: string            // "Kansas City Chiefs"
  team_abbr: string            // "KC"
  city: string | null          // "Kansas City"
  nickname: string | null      // "Chiefs"
  conference: 'AFC' | 'NFC' | null
  division: 'North' | 'South' | 'East' | 'West' | null
  logo_url: string | null
}
```

---

### `players`

Player profile records.

```typescript
interface Player {
  player_id: string            // Primary key: "espn-4046517"
  full_name: string            // "Patrick Mahomes"
  first_name: string | null
  last_name: string | null
  primary_position: string | null  // "QB"
  jersey_number: number | null
  height_inches: number | null
  weight_pounds: number | null
  birth_date: string | null
  college: string | null
  draft_year: number | null
  draft_round: number | null
  draft_pick: number | null
  current_team_id: string | null   // FK to teams
  status: string | null
}
```

---

### `stadiums`

NFL venue records.

```typescript
interface Stadium {
  stadium_id: string           // Primary key
  stadium_name: string         // "GEHA Field at Arrowhead Stadium"
  city: string
  state: string | null
  country: string
  capacity: number             // 76416
  surface_type: string         // "Grass"
  roof_type: 'Open' | 'Retractable' | 'Dome'
  latitude: number | null
  longitude: number | null
  elevation_feet: number | null
  opened_year: number | null
}
```

---

## Statistics Tables

### `team_game_stats`

Team-level game statistics.

```typescript
interface TeamGameStats {
  id: number                   // Primary key
  game_id: string              // FK to games
  season: number
  week: number
  team_id: string              // FK to teams
  opponent_team_id: string
  is_home: boolean

  points_scored: number
  points_allowed: number
  total_yards: number
  passing_yards: number
  rushing_yards: number
  turnovers: number
  turnovers_forced: number
  time_of_possession_seconds: number
  first_downs: number
  third_down_conversions: number
  third_down_attempts: number
  fourth_down_conversions: number
  fourth_down_attempts: number
  red_zone_attempts: number
  red_zone_scores: number
  penalties: number
  penalty_yards: number
  sacks_allowed: number

  // First Down Breakdown (WO-GAME-DETAILS-ENHANCEMENTS-001)
  passing_first_downs: number | null
  rushing_first_downs: number | null
  penalty_first_downs: number | null
}
```

---

### `player_game_stats`

Player-level game statistics (69 fields).

```typescript
interface PlayerGameStats {
  player_game_id: number       // Primary key
  player_id: string            // FK to players
  game_id: string              // FK to games
  season: number
  week: number
  team_id: string
  opponent_team_id: string
  started: boolean | null

  // PASSING (10 fields)
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

  // RUSHING (8 fields)
  rushing_attempts: number
  rushing_yards: number
  rushing_touchdowns: number
  rushing_longest: number
  rushing_fumbles: number
  rushing_fumbles_lost: number
  rushing_first_downs: number
  rushing_yards_after_contact: number

  // RECEIVING (10 fields)
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

  // DEFENSE (13 fields)
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

  // KICKING (8 fields)
  field_goals_made: number
  field_goals_attempted: number
  field_goal_longest: number
  field_goals_0_39: string | null    // "2/2"
  field_goals_40_49: string | null
  field_goals_50_plus: string | null
  extra_points_made: number
  extra_points_attempted: number

  // PUNTING (8 fields)
  punts: number
  punt_yards: number
  punt_average: number
  punt_longest: number
  punts_inside_20: number
  punt_touchbacks: number
  punt_fair_catches: number
  punt_return_yards: number

  // FANTASY (5 fields)
  fantasy_points_standard: number | null
  fantasy_points_ppr: number | null
  fantasy_points_half_ppr: number | null
  fantasy_points_dfs_dk: number | null
  fantasy_points_dfs_fd: number | null

  // KICK RETURNS (WO-GAME-DETAILS-ENHANCEMENTS-001)
  kick_return_attempts: number | null
  kick_return_yards: number | null
  kick_return_avg: number | null
  kick_return_long: number | null
  kick_return_tds: number | null

  // PUNT RETURNS (WO-GAME-DETAILS-ENHANCEMENTS-001)
  punt_return_attempts: number | null
  punt_return_yards: number | null
  punt_return_avg: number | null
  punt_return_long: number | null
  punt_return_tds: number | null
}
```

---

### `team_season_stats`

Aggregated team season statistics.

```typescript
interface TeamSeasonStats {
  team_id: string              // FK to teams
  season: number
  games_played: number
  wins: number
  losses: number
  ties: number
  win_percentage: number       // 0.750
  points_for: number
  points_against: number
  point_differential: number
  division_rank: number        // 1-4
  conference_rank: number      // 1-16
}
```

---

### `scoring_plays`

Individual scoring plays in a game.

```typescript
interface ScoringPlay {
  scoring_play_id: number      // Primary key
  game_id: string              // FK to games
  season: number
  quarter: number              // 1-4, 5=OT
  time_remaining_seconds: number
  team_id: string              // FK to teams
  scoring_type: string         // "TD", "FG", "XP", "2PT", "Safety"
  points: number
  description: string
}
```

---

### `game_weather`

Weather conditions for games.

```typescript
interface GameWeather {
  game_id: string              // PK + FK to games
  season: number
  week: number
  temperature_fahrenheit: number
  humidity_percentage: number
  wind_speed_mph: number
  wind_direction: string       // "NW"
  conditions: string           // "Clear", "Cloudy"
  precipitation: string        // "None", "Rain"
}
```

---

## Game Details Enhancements Tables (WO-GAME-DETAILS-ENHANCEMENTS-001)

### `game_officials`

Referee crew for each game.

```typescript
interface GameOfficial {
  id: number                   // Primary key
  game_id: string              // FK to games (espn-{id} format)
  position: string             // "referee", "umpire", "head_linesman", etc.
  official_name: string        // "Carl Cheffers"
  created_at: string
}
```

---

### `game_predictions`

ESPN expert predictions and pickcenter data.

```typescript
interface GamePrediction {
  id: number                   // Primary key
  game_id: string              // FK to games (espn-{id} format)
  source: string               // "espn_pickcenter"
  home_win_pct: number | null  // 0.65 = 65%
  away_win_pct: number | null
  spread: number | null        // -3.5
  over_under: number | null    // 47.5
  predicted_winner_team_id: string | null
  created_at: string
  updated_at: string
}
```

---

### `game_recaps`

Post-game article/recap from ESPN.

```typescript
interface GameRecap {
  id: number                   // Primary key
  game_id: string              // FK to games (espn-{id} format)
  headline: string             // "Chiefs rally to defeat Ravens in overtime thriller"
  summary: string | null       // Article body text
  published_at: string | null
  created_at: string
}
```

---

### `game_head_to_head`

Historical matchup records between teams.

```typescript
interface GameHeadToHead {
  id: number                   // Primary key
  game_id: string              // FK to games (espn-{id} format)
  home_all_time_wins: number   // Total wins in series
  away_all_time_wins: number
  ties: number
  home_streak: number | null   // Current streak (positive = home winning)
  away_streak: number | null
  last_meeting_date: string | null
  last_meeting_winner_team_id: string | null
  created_at: string
}
```

---

## nflverse Tables

These tables use nflverse game ID format: `YYYY_WW_AWAY_HOME`

### `snap_counts`

Player snap count data.

```typescript
interface SnapCount {
  id: number
  game_id: string              // "2024_01_BAL_KC"
  season: number
  week: number
  team_id: string
  player_name: string
  position: string | null

  offense_snaps: number
  offense_pct: number          // 0.85 = 85%
  defense_snaps: number
  defense_pct: number
  st_snaps: number             // Special teams
  st_pct: number
}
```

---

### `play_by_play`

Individual play records with analytics.

```typescript
interface PlayByPlay {
  play_id: string              // Primary key
  game_id: string              // "2024_01_BAL_KC"
  season: number
  week: number
  game_date: string | null

  quarter: number
  time_remaining_seconds: number
  play_description: string

  possession_team_id: string
  defensive_team_id: string

  play_type: string            // "pass", "run", "punt"
  yards_gained: number
  shotgun: boolean | null
  no_huddle: boolean | null

  epa: number | null           // Expected Points Added
  wpa: number | null           // Win Probability Added
  success: boolean | null

  air_yards: number | null
  yards_after_catch: number | null
  pass_length: 'short' | 'mid' | 'deep' | null
  pass_location: 'left' | 'middle' | 'right' | null
}
```

---

### `ngs_passing`

Next Gen Stats - Passing.

```typescript
interface NGSPassing {
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
```

---

### `ngs_rushing`

Next Gen Stats - Rushing.

```typescript
interface NGSRushing {
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
```

---

### `ngs_receiving`

Next Gen Stats - Receiving.

```typescript
interface NGSReceiving {
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
```

---

### `player_stats_advanced`

Advanced analytics from nflverse.

```typescript
interface AdvancedStats {
  id: number
  season: number
  week: number
  player_id: string | null
  player_name: string
  team_id: string
  position: string | null

  target_share: number
  air_yards_share: number
  wopr: number                 // Weighted Opportunity Rating
  racr: number                 // Receiver Air Conversion Ratio
  adot: number                 // Average Depth of Target

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
```

---

## Game ID Formats

### ESPN Format
- Pattern: `espn-{numeric_id}`
- Example: `espn-401772510`
- Used by: `games`, `team_game_stats`, `player_game_stats`, `scoring_plays`, `game_weather`

### nflverse Format
- Pattern: `{YYYY}_{WW}_{AWAY}_{HOME}`
- Example: `2024_01_BAL_KC`
- Used by: `snap_counts`, `play_by_play`, `ngs_*` tables

### Conversion Function
```typescript
function generateNflverseGameId(
  game: Game,
  homeTeam: Team,
  awayTeam: Team
): string {
  const week = String(game.week).padStart(2, '0')
  return `${game.season}_${week}_${awayTeam.team_id}_${homeTeam.team_id}`
}
```

---

## Relationships

```
teams
  ├── games.home_team_id
  ├── games.away_team_id
  ├── games.coin_toss_winner_team_id
  ├── players.current_team_id
  ├── team_game_stats.team_id
  ├── player_game_stats.team_id
  ├── team_season_stats.team_id
  └── scoring_plays.team_id

games
  ├── stadiums.stadium_id
  ├── team_game_stats.game_id
  ├── player_game_stats.game_id
  ├── scoring_plays.game_id
  ├── game_weather.game_id
  ├── game_officials.game_id
  ├── game_predictions.game_id
  ├── game_recaps.game_id
  └── game_head_to_head.game_id

players
  └── player_game_stats.player_id
```

---

## Utility Functions

Located in `src/types/game.ts`:

```typescript
// Convert nflverse game ID
function toNflverseGameId(
  season: number,
  week: number,
  awayTeamId: string,
  homeTeamId: string
): string

// Format time in mm:ss
function formatTime(seconds: number): string

// Format possession time
function formatPossession(seconds: number): string

// Get team logo URL
function getTeamLogoUrl(teamId: string): string

// Calculate current NFL week
function getCurrentWeek(season: number): number

// Get status badge config
function getGameStatusBadge(status: Game['status']): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}
```

---

## AI Assistant Notes

### Common Queries

```typescript
// Get game with teams
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!home_team_id(*),
    away_team:teams!away_team_id(*)
  `)
  .eq('game_id', gameId)
  .single()

// Get player stats with player info
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    player:players(*)
  `)
  .eq('game_id', gameId)

// Get standings with team info
const { data } = await supabase
  .from('team_season_stats')
  .select(`
    *,
    team:teams!team_id(*)
  `)
  .eq('season', season)
```

### Field Naming Conventions

- Plural for counts: `rushing_yards`, `passing_touchdowns`
- `_id` suffix for foreign keys: `team_id`, `player_id`
- `_pct` suffix for percentages: `offense_pct`
- Underscore naming throughout
