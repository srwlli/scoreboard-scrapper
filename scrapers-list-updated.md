# NFL Stats Platform - Scrapers List

> Complete reference of all scrapers available in the platform.
> Last updated: December 16, 2025

---

## Summary

- **Total Scrapers:** 17
- **Data Sources:** ESPN API, nflverse, YouTube
- **Primary Project:** `next-scraper` (scripts/scrapers/)
- **Video Scraper:** `scrapper` (scripts/scrape-videos.ts)

---

## Core Game Scrapers (ESPN API)

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 1 | **game-stats-scraper** | `game-stats-scraper.js` | Full game stats: player stats, team stats, scoring plays, rosters, venues, officials, recaps |
| 2 | **live-games-scraper** | `live-games-scraper.js` | Real-time game tracking and score updates |

### game-stats-scraper Details

Tables updated per game:
- `games` - Quarter scores (Q1-Q4, OT), final score, status
- `team_game_stats` - Team totals (yards, turnovers, possession)
- `player_game_stats` - Individual player stats (75+ columns)
- `scoring_plays` - Play-by-play scoring summary
- `game_rosters` - Active roster snapshot
- `game_officials` - Referee assignments
- `game_recaps` - Headline and summary text
- `stadiums` - Venue info

---

## Player Data Scrapers (nflverse)

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 3 | **player-stats-scraper** | `player-stats-scraper.js` | Advanced metrics: target_share, WOPR, RACR, dakota |
| 4 | **ngs-passing-scraper** | `ngs-passing-scraper.js` | Next Gen Stats QB metrics: time_to_throw, aggressiveness |
| 5 | **ngs-rushing-scraper** | `ngs-rushing-scraper.js` | Next Gen Stats rushing: efficiency, rush_yards_over_expected |
| 6 | **ngs-receiving-scraper** | `ngs-receiving-scraper.js` | Next Gen Stats receiving: avg_separation, avg_cushion |
| 7 | **snap-counts-scraper** | `snap-counts-scraper.js` | Snap count percentages by position |

### nflverse Data Schedule
- **Weekly:** Tuesday 8:00-9:00 AM ET (after stats are finalized)

---

## Team/League Scrapers

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 8 | **standings-scraper** | `standings-scraper.js` | Division standings, win/loss records |
| 9 | **roster-updates-scraper** | `roster-updates-scraper.js` | Player roster changes and transactions |
| 10 | **injuries-scraper** | `injuries-scraper.js` | Injury reports and player status |

---

## Betting/Analytics Scrapers

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 11 | **betting-scraper** | `betting-scraper.js` | Game betting lines and odds |
| 12 | **historical-betting-scraper** | `historical-betting-scraper.js` | Historical betting data backfill |
| 13 | **advanced-analytics-scraper** | `advanced-analytics-scraper.js` | Play-by-play and advanced stats |
| 14 | **elo-ratings-scraper** | `elo-ratings-scraper.js` | Team ELO ratings and projections |

---

## Utility Scrapers

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 15 | **backfill-historical** | `backfill-historical.js` | Historical data backfill utility |
| 16 | **nfl-top-100-games-scraper** | `nfl-top-100-games-scraper.js` | Top 100 all-time NFL games |

---

## Video Scraper

| # | Scraper | File | Purpose |
|---|---------|------|---------|
| 17 | **scrape-videos** | `scripts/scrape-videos.ts` | YouTube game highlights and videos |

Located in the `scrapper` project (not `next-scraper`).

---

## Usage Examples

### Backfill a specific week
```bash
cd /c/Users/willh/Desktop/projects/next-scraper
node scripts/scrapers/game-stats-scraper.js --season=2024 --week=1
```

### Backfill entire season
```bash
for week in {1..18}; do
  node scripts/scrapers/game-stats-scraper.js --season=2024 --week=$week
done
```

### Run live games scraper
```bash
node scripts/scrapers/live-games-scraper.js
```

### Run nflverse scrapers
```bash
node scripts/scrapers/player-stats-scraper.js --season=2024
node scripts/scrapers/ngs-passing-scraper.js --season=2024
node scripts/scrapers/ngs-rushing-scraper.js --season=2024
node scripts/scrapers/ngs-receiving-scraper.js --season=2024
```

---

## Data Flow

```
ESPN API ─────────────┐
                      │
nflverse GitHub ──────┼──► Scrapers ──► Supabase ──► Next.js App
                      │
YouTube ──────────────┘
```

---

## Known Issues

- Some games have invalid player IDs (e.g., `espn--8825`) from ESPN API that fail to insert
- These are typically "Team" placeholder entries and can be ignored
