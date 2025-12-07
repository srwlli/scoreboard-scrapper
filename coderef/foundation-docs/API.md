# API Reference - NFL Stats App

**Last Updated:** 2025-12-06
**Version:** 1.0.0

---

## Overview

NFL Stats App uses server-side data fetching functions (not REST endpoints). All data is fetched via Supabase queries in Next.js server components.

## Query Functions

### Location
```
src/lib/queries/
├── game-queries.ts      # Game detail data
├── scoreboard-queries.ts # Scoreboard & team data
└── standings-queries.ts  # Standings data
```

---

## Game Queries

### `getGameDetails(gameId: string)`

Fetches all data needed for the game detail page.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `gameId` | `string` | ESPN game ID (e.g., `espn-401772510`) |

**Returns:** `Promise<GameDetailData | null>`

```typescript
interface GameDetailData {
  game: Game
  homeTeam: Team
  awayTeam: Team
  stadium: Stadium | null
  weather: GameWeather | null
  homeTeamStats: TeamGameStats | null
  awayTeamStats: TeamGameStats | null
  playerStats: PlayerGameStats[]
  scoringPlays: ScoringPlay[]
  snapCounts: SnapCount[]
  playByPlay: PlayByPlay[]
  ngsPassing: NGSPassing[]
  ngsRushing: NGSRushing[]
  ngsReceiving: NGSReceiving[]
  advancedStats: AdvancedStats[]
}
```

**Example:**
```typescript
import { getGameDetails } from '@/lib/queries/game-queries'

const data = await getGameDetails('espn-401772510')

if (data) {
  console.log(data.game.home_score) // 24
  console.log(data.homeTeam.team_name) // "Kansas City Chiefs"
  console.log(data.playerStats.length) // 58
}
```

**Tables Queried:**
- `games` (with `teams`, `stadiums` joins)
- `game_weather`
- `team_game_stats`
- `player_game_stats` (with `players` join)
- `scoring_plays`
- `snap_counts`
- `play_by_play`
- `ngs_passing`, `ngs_rushing`, `ngs_receiving`
- `player_stats_advanced`

---

### `getGameMetadata(gameId: string)`

Fetches minimal game info for SEO/metadata.

**Returns:** `Promise<{ game: Game, homeTeam: Team, awayTeam: Team } | null>`

```typescript
const meta = await getGameMetadata('espn-401772510')
// meta.game.week = 1
// meta.homeTeam.team_name = "Kansas City Chiefs"
```

---

### `getAllGameIds()`

Returns list of all game IDs for static generation.

**Returns:** `Promise<string[]>`

```typescript
const ids = await getAllGameIds()
// ['espn-401772510', 'espn-401772511', ...]
```

---

## Scoreboard Queries

### `getTeams()`

Fetches all NFL teams, sorted by name.

**Returns:** `Promise<Team[]>`

```typescript
interface Team {
  team_id: string
  team_name: string
  team_abbr: string
  city: string | null
  nickname: string | null
  conference: 'AFC' | 'NFC' | null
  division: 'North' | 'South' | 'East' | 'West' | null
  logo_url: string | null
}
```

---

### `getAvailableSeasons()`

Returns list of seasons with game data.

**Returns:** `Promise<number[]>`

```typescript
const seasons = await getAvailableSeasons()
// [2025, 2024, 2023]
```

---

### `getGamesForWeek(season: number, week: number)`

Fetches all games for a specific week.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `season` | `number` | Season year (e.g., `2024`) |
| `week` | `number` | Week number (1-18) |

**Returns:** `Promise<ScoreboardGame[]>`

```typescript
interface ScoreboardGame extends Game {
  home_team: Team
  away_team: Team
}

const games = await getGamesForWeek(2024, 1)
// Returns 16 games with team info joined
```

---

### `getGamesForTeam(season: number, teamId: string)`

Fetches all games for a team's season schedule.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `season` | `number` | Season year |
| `teamId` | `string` | Team ID (e.g., `KC`) |

**Returns:** `Promise<ScoreboardGame[]>`

```typescript
const games = await getGamesForTeam(2024, 'KC')
// Returns 17 games for Chiefs' 2024 schedule
```

---

### `getMaxWeekForSeason(season: number)`

Returns the highest week number with games for a season.

**Returns:** `Promise<number>`

```typescript
const maxWeek = await getMaxWeekForSeason(2024)
// 18
```

---

## Standings Queries

### `getStandings(season: number)`

Fetches all standings grouped by conference and division.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `season` | `number` | Season year |

**Returns:** `Promise<StandingsData>`

```typescript
interface StandingsData {
  season: number
  afc: DivisionStandings[]
  nfc: DivisionStandings[]
}

interface DivisionStandings {
  conference: 'AFC' | 'NFC'
  division: 'North' | 'South' | 'East' | 'West'
  teams: TeamStanding[]
}

interface TeamStanding extends TeamSeasonStats {
  team: Team
}
```

**Example:**
```typescript
const standings = await getStandings(2024)

standings.afc.forEach(division => {
  console.log(`AFC ${division.division}`)
  division.teams.forEach(team => {
    console.log(`${team.team.team_name}: ${team.wins}-${team.losses}`)
  })
})
```

---

### `getConferenceStandings(season: number, conference: 'AFC' | 'NFC')`

Fetches standings for a single conference, sorted by conference rank.

**Returns:** `Promise<TeamStanding[]>`

```typescript
const afc = await getConferenceStandings(2024, 'AFC')
// Returns 16 teams sorted by conference rank
```

---

## Client-Side Fetching

For interactive components, use the Supabase client directly:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function ScoreboardClient({ initialGames }) {
  const [games, setGames] = useState(initialGames)

  const fetchGames = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*)
      `)
      .eq('season', season)
      .eq('week', week)
      .order('game_date')

    setGames(data)
  }
}
```

---

## Error Handling

All query functions throw on Supabase errors:

```typescript
try {
  const data = await getGameDetails(gameId)
  if (!data) {
    // Game not found
    notFound()
  }
} catch (error) {
  // Database error
  console.error('Query failed:', error)
  throw error
}
```

---

## Performance

### Parallel Queries
Game detail page uses `Promise.all()` for 11 parallel queries:

```typescript
const [
  weatherResult,
  homeStatsResult,
  awayStatsResult,
  playerStatsResult,
  scoringPlaysResult,
  snapCountsResult,
  playByPlayResult,
  ngsPassingResult,
  ngsRushingResult,
  ngsReceivingResult,
  advancedStatsResult
] = await Promise.all([...])
```

### Query Times
| Query | Typical Time |
|-------|--------------|
| Single game | ~50ms |
| Games for week (16) | ~100ms |
| Team season (17 games) | ~80ms |
| Standings (32 teams) | ~60ms |
| Full game detail | ~200ms (parallel) |

---

## AI Assistant Notes

### Adding New Queries
1. Create function in appropriate `*-queries.ts` file
2. Use `await createClient()` from `@/lib/supabase/server`
3. Add return type interface to `src/types/game.ts`
4. Use `.single()` for expected single records
5. Handle `null` returns for not-found cases

### Common Patterns
```typescript
// Server-side query
import { createClient } from '@/lib/supabase/server'

export async function getExample(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

```typescript
// With joins
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!home_team_id(*),
    away_team:teams!away_team_id(*)
  `)
```
