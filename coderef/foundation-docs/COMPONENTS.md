# Components Reference - NFL Stats App

**Framework:** Next.js 16 / React 19
**Version:** 1.0.0
**Last Updated:** 2025-12-06

---

## Component Organization

```
src/components/
├── game/                    # Game detail page components
├── scoreboard/              # Scoreboard page components
├── standings/               # Standings page components
├── ui/                      # shadcn/ui primitives
├── site-header.tsx          # Global header
├── theme-provider.tsx       # Dark/light mode
├── header-context.tsx       # Header state management
└── dashboard-card.tsx       # Dashboard navigation cards
```

---

## Game Components

### GameHeader

Displays game score with quarter-by-quarter breakdown.

**Location:** `src/components/game/GameHeader.tsx`

**Props:**
```typescript
interface GameHeaderProps {
  game: Game
  homeTeam: Team
  awayTeam: Team
}
```

**Features:**
- Large team logos with scores
- Status badge (FINAL, LIVE, scheduled time)
- Quarter scores table (for completed games)
- Overtime indicator
- Broadcast network badge

**Usage:**
```tsx
<GameHeader
  game={data.game}
  homeTeam={data.homeTeam}
  awayTeam={data.awayTeam}
/>
```

---

### TeamStatsCard

Displays team statistics comparison.

**Location:** `src/components/game/TeamStatsCard.tsx`

**Props:**
```typescript
interface TeamStatsCardProps {
  homeStats: TeamGameStats | null
  awayStats: TeamGameStats | null
  homeTeam: Team
  awayTeam: Team
}
```

**Stats Displayed:**
- Total Yards, Passing Yards, Rushing Yards
- First Downs
- 3rd/4th Down Conversions
- Red Zone Efficiency
- Turnovers, Penalties
- Time of Possession

**Features:**
- Winner highlighting (bold + primary color)
- Lower-is-better highlighting for turnovers
- Handles null stats gracefully

---

### PlayerStatsCard

Interactive player statistics with team/category filters.

**Location:** `src/components/game/PlayerStatsCard.tsx`

**Props:**
```typescript
interface PlayerStatsCardProps {
  playerStats: PlayerGameStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}
```

**Categories:**
| Tab | Stats Shown |
|-----|-------------|
| Pass | C/ATT, Yards, TD, INT, Rating |
| Rush | ATT, Yards, TD, Long, Y/A |
| Rec | REC/TGT, Yards, TD, Long, YAC |
| Def | Tackles, Sacks, INT, PD |
| Kick | FG, XP, Long |
| Punt | Punts, Yards, Avg, I20 |

**Features:**
- Team toggle (home/away)
- 6-tab category navigation
- Sorted by primary stat per category
- `'use client'` for interactivity

---

### ScoringPlays

Timeline of scoring plays by quarter.

**Location:** `src/components/game/ScoringPlays.tsx`

**Props:**
```typescript
interface ScoringPlaysProps {
  plays: ScoringPlay[]
  teams: Record<string, Team>
}
```

**Features:**
- Grouped by quarter
- Team logo + score delta
- Play description
- Time remaining display

---

### TopEPAPlays

Highest EPA (Expected Points Added) plays.

**Location:** `src/components/game/TopEPAPlays.tsx`

**Props:**
```typescript
interface TopEPAPlaysProps {
  plays: PlayByPlay[]
  teams: Record<string, Team>
}
```

**Features:**
- Top 5 plays by EPA value
- Team logo + play description
- EPA value badge
- Quarter + time display

---

### SnapCountsCard

Player snap count percentages.

**Location:** `src/components/game/SnapCountsCard.tsx`

**Props:**
```typescript
interface SnapCountsCardProps {
  snapCounts: SnapCount[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}
```

**Features:**
- Offense/Defense/Special Teams tabs
- Snap count + percentage
- Team toggle
- Sorted by snap percentage

---

### NGSStatsCard

Next Gen Stats (NFL tracking data).

**Location:** `src/components/game/NGSStatsCard.tsx`

**Props:**
```typescript
interface NGSStatsCardProps {
  passing: NGSPassing[]
  rushing: NGSRushing[]
  receiving: NGSReceiving[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}
```

**Stats Categories:**
- **Passing:** Time to throw, air yards, aggressiveness, CPOE
- **Rushing:** Efficiency, time to LOS, RYOE
- **Receiving:** Cushion, separation, YAC above expected

---

### AdvancedStatsCard

Advanced analytics from nflverse.

**Location:** `src/components/game/AdvancedStatsCard.tsx`

**Props:**
```typescript
interface AdvancedStatsCardProps {
  stats: AdvancedStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}
```

**Metrics:**
- Target Share, Air Yards Share
- WOPR (Weighted Opportunity Rating)
- RACR (Receiver Air Conversion Ratio)
- ADOT (Average Depth of Target)

---

### VenueCard

Stadium information display.

**Location:** `src/components/game/VenueCard.tsx`

**Props:**
```typescript
interface VenueCardProps {
  stadium: Stadium | null
  attendance: number | null
}
```

**Features:**
- Stadium name + location
- Surface type (Grass/FieldTurf)
- Roof type (Open/Dome/Retractable)
- Attendance count

---

### WeatherCard

Game weather conditions.

**Location:** `src/components/game/WeatherCard.tsx`

**Props:**
```typescript
interface WeatherCardProps {
  weather: GameWeather | null
}
```

**Features:**
- Temperature (°F)
- Conditions (Clear, Cloudy, etc.)
- Wind speed + direction
- Humidity percentage

---

### DataSourceFooter

Data attribution footer.

**Location:** `src/components/game/DataSourceFooter.tsx`

**Features:**
- ESPN + nflverse attribution
- Data coverage indicators
- Section list

---

## Scoreboard Components

### ScoreboardClient

Main scoreboard with filters.

**Location:** `src/components/scoreboard/ScoreboardClient.tsx`

**Props:**
```typescript
interface ScoreboardClientProps {
  initialTeams: Team[]
  initialSeasons: number[]
  initialGames: ScoreboardGame[]
  initialSeason: number
  initialWeek: number
  initialTeamId: string | null
  initialMaxWeek: number
}
```

**Features:**
- Season/Week/Team filters
- Grid/List view toggle
- Team schedule view (when team selected)
- Team record calculation
- URL hash state sync
- Client-side data fetching on filter change

---

### GameCard

Individual game score card.

**Location:** `src/components/scoreboard/GameCard.tsx`

**Props:**
```typescript
interface GameCardProps {
  game: Game
  homeTeam: Team
  awayTeam: Team
  showWeek?: boolean
  homeRecord?: string
  awayRecord?: string
}
```

**Features:**
- Team logos + abbreviations
- Scores with winner highlighting
- Status badge (FINAL/LIVE/date)
- Optional team records
- Click navigates to game detail

---

### SeasonSelector

Season dropdown filter.

**Location:** `src/components/scoreboard/SeasonSelector.tsx`

**Props:**
```typescript
interface SeasonSelectorProps {
  value: number
  onChange: (season: number) => void
  availableSeasons: number[]
}
```

---

### WeekSelector

Week dropdown filter (1-18).

**Location:** `src/components/scoreboard/WeekSelector.tsx`

**Props:**
```typescript
interface WeekSelectorProps {
  value: number
  onChange: (week: number) => void
  maxWeek: number
}
```

---

### TeamFilter

Team selection dropdown.

**Location:** `src/components/scoreboard/TeamFilter.tsx`

**Props:**
```typescript
interface TeamFilterProps {
  value: string | null
  onChange: (teamId: string | null) => void
  teams: Team[]
}
```

---

## Standings Components

### StandingsClient

Conference standings display.

**Location:** `src/components/standings/StandingsClient.tsx`

**Props:**
```typescript
interface StandingsClientProps {
  standings: StandingsData
}
```

**Features:**
- AFC/NFC toggle
- Division grouping
- Team records and rankings

---

### DivisionTable

Single division standings table.

**Location:** `src/components/standings/DivisionTable.tsx`

**Props:**
```typescript
interface DivisionTableProps {
  division: DivisionStandings
}
```

**Columns:**
- Team logo + name
- W-L-T record
- Win %
- PF (Points For)
- PA (Points Against)
- Diff (Point Differential)

---

## UI Primitives (shadcn/ui)

Located in `src/components/ui/`:

| Component | Usage |
|-----------|-------|
| `Card` | Content containers |
| `Table` | Data tables |
| `Tabs` | Tab navigation |
| `Badge` | Status indicators |
| `Button` | Actions |
| `Avatar` | Team logos |
| `Select` | Dropdowns |
| `Separator` | Dividers |
| `Skeleton` | Loading states |
| `Toggle` | Binary options |
| `ToggleGroup` | Multi-option toggles |
| `Sheet` | Mobile drawer |

---

## Component Patterns

### Server Component (Default)

```tsx
// No 'use client' directive
import { Card } from '@/components/ui/card'

export function StaticComponent({ data }) {
  return <Card>{data.value}</Card>
}
```

### Client Component (Interactive)

```tsx
'use client'

import { useState } from 'react'

export function InteractiveComponent({ initialValue }) {
  const [value, setValue] = useState(initialValue)
  // ...
}
```

### Null Handling Pattern

```tsx
export function DataCard({ data }: { data: SomeType | null }) {
  if (!data) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return <Card>...</Card>
}
```

---

## AI Assistant Notes

### Adding New Components

1. Create in appropriate category folder
2. Export props interface in `src/types/game.ts`
3. Use shadcn/ui primitives from `src/components/ui/`
4. Add `'use client'` only if needed for interactivity
5. Handle null/empty states gracefully

### Styling Conventions

- Use Tailwind CSS utility classes
- `tabular-nums` for numeric data
- `text-muted-foreground` for secondary text
- `font-semibold` for emphasis
- Mobile-first responsive (`sm:`, `md:`, `lg:`)
