# NFL Stats App

> Next.js application for viewing NFL game statistics, scores, and standings

**Version:** 0.1.0
**Last Updated:** 2025-12-06
**Maintainer:** Development Team

---

## Overview

NFL Stats App is a modern web application built with Next.js 16 that provides comprehensive NFL game data including:

- Live and historical game scores
- Detailed game statistics (team and player level)
- Division and conference standings
- Advanced analytics (EPA, WPA, NGS data)
- Play-by-play breakdowns

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.0 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, shadcn/ui, Radix UI |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Data Sources | ESPN API, nflverse |

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account with project configured

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd scrapper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard home
│   ├── scoreboard/        # Scoreboard page
│   ├── standings/         # Standings page
│   └── game/[gameId]/     # Game detail page
├── components/
│   ├── game/              # Game detail components
│   ├── scoreboard/        # Scoreboard components
│   ├── standings/         # Standings components
│   └── ui/                # shadcn/ui primitives
├── lib/
│   ├── supabase/          # Supabase client config
│   └── queries/           # Data fetching functions
└── types/
    └── game.ts            # TypeScript interfaces
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with navigation cards |
| `/scoreboard` | NFL scores by week with filters |
| `/standings` | Division/conference standings |
| `/game/[gameId]` | Detailed game statistics |

## Features

### Scoreboard
- Season and week selection
- Team filter for schedule view
- Grid/List view toggle
- Team records display

### Game Details
- Game header with scores and quarter breakdown
- Team statistics comparison
- Player statistics (passing, rushing, receiving, defense)
- Scoring plays timeline
- Top EPA plays
- Snap counts
- NGS advanced stats
- Venue and weather info

### Standings
- AFC and NFC divisions
- Win/Loss/Tie records
- Point differential
- Division and conference rankings

## Data Sources

| Source | Data Type |
|--------|-----------|
| ESPN API | Games, scores, team stats, player stats |
| nflverse | Snap counts, EPA, NGS stats, play-by-play |

## Common Issues

### Supabase Connection Error
```
Error: Could not connect to Supabase
```
**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### Missing Game Data
```
Error: No data found for game
```
**Solution:** Ensure the game ID exists in the database and scrapers have run

### Build Failures
```
Type error: Cannot find module
```
**Solution:** Run `npm install` and check import paths

## Related Documentation

- [ARCHITECTURE.md](coderef/foundation-docs/ARCHITECTURE.md) - System design
- [API.md](coderef/foundation-docs/API.md) - Data queries
- [COMPONENTS.md](coderef/foundation-docs/COMPONENTS.md) - UI components
- [SCHEMA.md](coderef/foundation-docs/SCHEMA.md) - Database schema

---

## AI Assistant Notes

When working with this codebase:

1. **Database queries** are in `src/lib/queries/` - use server components
2. **Types** are centralized in `src/types/game.ts` - 15 interfaces, 146 fields
3. **UI components** use shadcn/ui patterns in `src/components/ui/`
4. **Two game ID formats**: ESPN (`espn-401772510`) and nflverse (`2024_01_BAL_KC`)

```typescript
// Example: Fetching game data
import { getGameDetails } from '@/lib/queries/game-queries'

const data = await getGameDetails('espn-401772510')
```
