# Architecture - NFL Stats App

**Last Updated:** 2025-12-06
**Version:** 1.0.0

---

## System Overview

NFL Stats App is a Next.js 16 application using the App Router pattern with server-side rendering and Supabase as the data layer.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │ Scoreboard  │  │   Game Details      │  │
│  │   /         │  │ /scoreboard │  │   /game/[gameId]    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Server Components (RSC)                   │  │
│  │         src/lib/queries/*-queries.ts                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  games   │  │  teams   │  │ players  │  │  stats   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16.1.0 | Server-side rendering, routing |
| Runtime | React 19 | UI rendering |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | shadcn/ui, Radix | Accessible UI primitives |
| Database | Supabase | PostgreSQL with REST API |
| Theme | next-themes | Dark/light mode |

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard home
│   ├── loading.tsx              # Global loading state
│   ├── scoreboard/
│   │   └── page.tsx             # Scoreboard (server component)
│   ├── standings/
│   │   └── page.tsx             # Standings (server component)
│   └── game/[gameId]/
│       ├── page.tsx             # Game detail (server component)
│       ├── loading.tsx          # Game loading skeleton
│       ├── error.tsx            # Error boundary
│       └── not-found.tsx        # 404 page
│
├── components/
│   ├── game/                    # Game detail components
│   │   ├── GameHeader.tsx       # Score display with quarters
│   │   ├── TeamStatsCard.tsx    # Team stats comparison
│   │   ├── PlayerStatsCard.tsx  # Player stats with tabs
│   │   ├── ScoringPlays.tsx     # Scoring timeline
│   │   ├── TopEPAPlays.tsx      # EPA highlights
│   │   ├── SnapCountsCard.tsx   # Snap count data
│   │   ├── NGSStatsCard.tsx     # Next Gen Stats
│   │   ├── AdvancedStatsCard.tsx# Advanced analytics
│   │   ├── VenueCard.tsx        # Stadium info
│   │   ├── WeatherCard.tsx      # Weather conditions
│   │   └── DataSourceFooter.tsx # Data attribution
│   │
│   ├── scoreboard/              # Scoreboard components
│   │   ├── ScoreboardClient.tsx # Main client component
│   │   ├── GameCard.tsx         # Game score card
│   │   ├── SeasonSelector.tsx   # Season dropdown
│   │   ├── WeekSelector.tsx     # Week dropdown
│   │   ├── TeamFilter.tsx       # Team filter dropdown
│   │   ├── TeamScheduleHeader.tsx# Team schedule view
│   │   └── ScoreboardSkeleton.tsx# Loading state
│   │
│   ├── standings/               # Standings components
│   │   ├── StandingsClient.tsx  # Main client component
│   │   └── DivisionTable.tsx    # Division standings table
│   │
│   ├── ui/                      # shadcn/ui primitives
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── site-header.tsx          # Global header
│   ├── theme-provider.tsx       # Theme context
│   ├── header-context.tsx       # Header state
│   └── dashboard-card.tsx       # Dashboard navigation
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client
│   ├── queries/
│   │   ├── game-queries.ts      # Game detail data
│   │   ├── scoreboard-queries.ts# Scoreboard data
│   │   └── standings-queries.ts # Standings data
│   └── utils.ts                 # Utility functions (cn)
│
└── types/
    └── game.ts                  # All TypeScript interfaces
```

## Data Flow

### Server-Side Rendering (Primary Pattern)

```
1. Browser requests /game/espn-401772510
                    │
2. Next.js server component executes
                    │
3. getGameDetails() called
                    │
4. Supabase queries run in parallel:
   - games (with teams, stadium joins)
   - team_game_stats
   - player_game_stats (with player join)
   - scoring_plays
   - snap_counts
   - play_by_play
   - ngs_passing, ngs_rushing, ngs_receiving
   - player_stats_advanced
                    │
5. HTML rendered with data
                    │
6. Sent to browser (hydrated)
```

### Client-Side Interactivity

```
ScoreboardClient.tsx:
  - Filters (season, week, team) → State
  - State change → Supabase query (client)
  - Data → Re-render game cards
```

## Component Patterns

### Server Components (Default)

```typescript
// src/app/game/[gameId]/page.tsx
export default async function GamePage({ params }) {
  const data = await getGameDetails(params.gameId)
  return <GameHeader game={data.game} ... />
}
```

### Client Components (Interactive)

```typescript
// src/components/scoreboard/ScoreboardClient.tsx
'use client'

export function ScoreboardClient({ initialGames }) {
  const [games, setGames] = useState(initialGames)
  // Filter handlers, fetch on change
}
```

## Database Design Rationale

### Two Game ID Formats

| Source | Format | Example | Used For |
|--------|--------|---------|----------|
| ESPN | `espn-{id}` | `espn-401772510` | games, stats, scoring |
| nflverse | `YYYY_WW_AWAY_HOME` | `2024_01_BAL_KC` | snap counts, EPA, NGS |

**Why:** ESPN provides real-time data with their IDs. nflverse provides advanced analytics with their own ID format. We store both and convert as needed.

```typescript
function generateNflverseGameId(game, homeTeam, awayTeam) {
  const week = String(game.week).padStart(2, '0')
  return `${game.season}_${week}_${awayTeam.team_id}_${homeTeam.team_id}`
}
```

### Query Strategy

All queries use `Promise.all()` for parallel execution:

```typescript
const [
  weatherResult,
  homeStatsResult,
  awayStatsResult,
  playerStatsResult,
  ...
] = await Promise.all([
  supabase.from('game_weather').select('*').eq('game_id', gameId).single(),
  supabase.from('team_game_stats').select('*').eq('game_id', gameId)...,
  ...
])
```

## Key Design Decisions

### 1. Server-First Rendering
- All data fetching in server components
- Client components only for interactivity
- Reduces client bundle size

### 2. Centralized Types
- All interfaces in `src/types/game.ts`
- 15 interfaces covering 146 fields
- Prevents type duplication

### 3. Parallel Data Fetching
- All related data fetched in single `Promise.all()`
- Reduces waterfall requests
- ~200ms per game detail page

### 4. shadcn/ui Components
- Consistent design system
- Accessible by default (Radix primitives)
- Easily customizable

### 5. Supabase SSR Package
- `@supabase/ssr` for server components
- Proper cookie handling
- Type-safe queries

## Performance Considerations

| Metric | Target | Approach |
|--------|--------|----------|
| TTFB | <500ms | Server rendering, parallel queries |
| FCP | <1s | Minimal JS, streaming |
| Bundle | <200KB | Tree shaking, dynamic imports |
| Queries | <10 per page | Parallel execution |

## Security

- Environment variables for secrets
- Server-side data fetching only
- No client-exposed API keys (Supabase anon key is safe)
- RLS policies on Supabase tables

---

## AI Assistant Notes

### Adding New Pages
1. Create `src/app/{route}/page.tsx` (server component)
2. Add query function in `src/lib/queries/`
3. Add types to `src/types/game.ts`

### Adding New Components
1. Create in appropriate `src/components/{category}/`
2. Export props interface in `src/types/game.ts`
3. Use shadcn/ui primitives from `src/components/ui/`

### Database Queries
- Always use `await createClient()` from `@/lib/supabase/server`
- Use `.single()` for expected single records
- Handle null/error cases explicitly
