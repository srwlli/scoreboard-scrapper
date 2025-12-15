# Historical Data Backfill Plan

## Overview
Backfill historical NFL data for full game details page recreation. Two data sources:
- **nflverse** (free): Stats, EPA/WPA, snap counts, NGS (1999-present)
- **ESPN API** (free): Officials, rosters, scoring plays, quarter scores, venues
- **Open-Meteo** (free): Historical weather data

**Note**: Betting data excluded from backfill.

---

## Data Sources Summary

| Dataset | Source | Start Year | Notes |
|---------|--------|------------|-------|
| Play-by-play (EPA/WPA) | nflverse | 1999 | Full play data with analytics |
| Player Stats | nflverse | 1999 | Target share, WOPR, RACR, air yards |
| Snap Counts | nflverse | 2012 | Offensive/defensive/ST snaps |
| Next Gen Stats | nflverse | 2016 | AWS tracking chips data |
| Officials/Refs | ESPN | 2000+ | Game referee crews |
| Venues/Stadiums | ESPN + hardcoded | All | Capacity, coordinates, surface |
| Weather | Open-Meteo | 1999 | Temperature, wind, conditions |
| Quarter Scores | ESPN | 2000+ | Q1-Q4 + OT scoring |
| Scoring Plays | ESPN | 2000+ | TD, FG, safety descriptions |
| Game Rosters | ESPN | 2000+ | 53-man active/inactive |

---

## Scrapers Status

### ✅ Ready for Historical
| Scraper | File | Usage |
|---------|------|-------|
| Player Stats | `player-stats-scraper.js` | `--season=2024` supported |
| Weather | `weather-scraper.js` | Fetches from Open-Meteo archive API |
| Stadiums | `stadium-enrichment.js` | Hardcoded data, run once |

### ⚠️ Need --season Flag Added (nflverse)
| Scraper | File | Data |
|---------|------|------|
| Snap Counts | `snap-counts-scraper.js` | Off/Def/ST snaps per game |
| Advanced Analytics | `advanced-analytics-scraper.js` | EPA, WPA, success rate |
| NGS Passing | `ngs-passing-scraper.js` | Time to throw, CPOE |
| NGS Rushing | `ngs-rushing-scraper.js` | Yards over expected |
| NGS Receiving | `ngs-receiving-scraper.js` | Separation, YAC |

### ⚠️ Need --season Flag Added (ESPN)
| Scraper | File | Data |
|---------|------|------|
| Game Stats | `game-stats-scraper.js` | Officials, rosters, quarter scores, scoring plays |
| Weather | `weather-scraper.js` | Filter games by season |

---

## Backfill Scope (ALL Seasons)

### nflverse Data (Stats & Analytics)
| Scraper | Seasons | Est. Records |
|---------|---------|--------------|
| Player Stats | 1999-2024 (26 seasons) | ~500K |
| Play-by-play | 1999-2024 (26 seasons) | ~1.5M plays |
| Snap Counts | 2012-2024 (13 seasons) | ~300K |
| NGS Passing | 2016-2024 (9 seasons) | ~50K |
| NGS Rushing | 2016-2024 (9 seasons) | ~50K |
| NGS Receiving | 2016-2024 (9 seasons) | ~80K |

### ESPN Data (Game Details)
| Scraper | Seasons | Est. Records |
|---------|---------|--------------|
| Game Stats (officials, rosters, etc.) | 2000-2024 (25 seasons) | ~6K games |
| Quarter Scores | 2000-2024 (25 seasons) | ~6K games |
| Scoring Plays | 2000-2024 (25 seasons) | ~100K plays |
| Game Rosters | 2000-2024 (25 seasons) | ~600K entries |

### Weather Data (Open-Meteo)
| Scraper | Seasons | Est. Records |
|---------|---------|--------------|
| Game Weather | 1999-2024 (26 seasons) | ~5K games (outdoor only) |

**Includes**: Regular season + Playoffs + Super Bowl

---

## Implementation Steps

### Step 1: One-Time Setup
Run stadium enrichment to add coordinates (required for weather):
```bash
npm run enrich:stadiums
```

### Step 2: Update Scrapers for --season Support

**nflverse scrapers** - Add `--season=YEAR` argument:
- `snap-counts-scraper.js`
- `advanced-analytics-scraper.js`
- `ngs-passing-scraper.js`
- `ngs-rushing-scraper.js`
- `ngs-receiving-scraper.js`

**ESPN scrapers** - Add `--season=YEAR` argument:
- `game-stats-scraper.js` (line 40: change `SEASON_YEAR = 2025` to use arg)
- `weather-scraper.js` (add season filter for games query)

**Additional: Add drive extraction to game-stats-scraper.js**
- ESPN `/summary` endpoint already returns `drives.previous` for completed games
- Use existing `extractDrives()` from `live-data-extractor.js`
- Upsert to `live_drives` table (same schema as live games)

### Step 3: Create Backfill Script
Create `scripts/backfill-historical.js`:
```javascript
const seasons = [2020, 2021, 2022, 2023, 2024];

for (const season of seasons) {
  console.log(`\n========== SEASON ${season} ==========\n`);

  // Phase A: nflverse stats
  await runScript('player-stats-scraper.js', `--season=${season}`);
  await runScript('snap-counts-scraper.js', `--season=${season}`);
  await runScript('advanced-analytics-scraper.js', `--season=${season}`);

  // Phase B: NGS (2016+)
  if (season >= 2016) {
    await runScript('ngs-passing-scraper.js', `--season=${season}`);
    await runScript('ngs-rushing-scraper.js', `--season=${season}`);
    await runScript('ngs-receiving-scraper.js', `--season=${season}`);
  }

  // Phase C: ESPN game details (officials, rosters, scoring plays)
  await runScript('game-stats-scraper.js', `--season=${season}`);

  // Phase D: Weather (requires stadium coordinates)
  await runScript('weather-scraper.js', `--season=${season}`);
}
```

### Step 4: Run in Phases
```bash
# Phase 1: Recent (2020-2024) - Full data
node scripts/backfill-historical.js --start=2020 --end=2024

# Phase 2: NGS era (2016-2019) - Full data
node scripts/backfill-historical.js --start=2016 --end=2019

# Phase 3: Snap counts era (2012-2015) - No NGS
node scripts/backfill-historical.js --start=2012 --end=2015

# Phase 4: Historical (1999-2011) - Stats + Weather only
node scripts/backfill-historical.js --start=1999 --end=2011
```

---

## Game Details Page Data Requirements

For a complete historical game details page, you need:

| Component | Table | Scraper | Available From |
|-----------|-------|---------|----------------|
| Scoreboard | `games` | live-games-scraper | 1999 |
| Quarter Scores | `games` (q1-q4 columns) | game-stats-scraper | 2000 |
| Officials/Refs | `game_officials` | game-stats-scraper | 2000 |
| Venue/Stadium | `stadiums` | stadium-enrichment | All |
| Weather | `game_weather` | weather-scraper | 1999 |
| Scoring Plays | `scoring_plays` | game-stats-scraper | 2000 |
| Team Stats | `team_game_stats` | game-stats-scraper | 2000 |
| Player Stats | `player_game_stats` | game-stats-scraper | 2000 |
| Game Rosters | `game_rosters` | game-stats-scraper | 2000 |
| Win Probability | `win_probability` | game-stats-scraper | 2015+ |
| Play-by-Play | `live_plays` | live-games-scraper | Live only |
| **Drives** | `live_drives` | **game-stats-scraper** | **2000+ (ESPN)** |
| Snap Counts | `snap_counts` | snap-counts-scraper | 2012 |
| Advanced Stats | `advanced_game_stats` | advanced-analytics-scraper | 1999 |
| NGS Passing | `ngs_passing` | ngs-passing-scraper | 2016 |
| NGS Rushing | `ngs_rushing` | ngs-rushing-scraper | 2016 |
| NGS Receiving | `ngs_receiving` | ngs-receiving-scraper | 2016 |
| Videos | `game_videos` | youtube-scraper | Manual/Recent |

**Note**: `live_plays` is only captured during live games. For historical games:
- **Drives** → Available via ESPN `/summary` endpoint OR nflverse PBP `drive` fields
- **Play-by-play analytics** → Use nflverse PBP for EPA/WPA enrichment

---

## Hybrid Data Workflow

### Live vs Historical Data Flow

```
LIVE GAMES (ESPN - Real-time)
├── live-games-scraper.js (every 30s during games)
│   ├── live_plays   → Basic play-by-play text
│   └── live_drives  → Drive summaries with results

POST-GAME ENRICHMENT (nflverse - Tuesdays)
├── advanced-analytics-scraper.js (enhanced)
│   ├── UPDATE live_plays with EPA, WPA, CPOE, air_yards, player IDs
│   └── UPSERT live_drives with drive analytics

HISTORICAL BACKFILL (nflverse - One-time)
├── Same scraper with --season flag
│   ├── INSERT live_plays (full PBP with analytics)
│   └── INSERT live_drives (aggregated from PBP)
```

### nflverse PBP - Available Fields NOT Currently Used

#### Drive Data (for `live_drives` table)
| Field | Description |
|-------|-------------|
| `drive` | Drive number |
| `fixed_drive_result` | Drive outcome (TD, FG, Punt, Turnover, etc.) |
| `drive_play_count` | Number of plays in drive |
| `drive_time_of_possession` | TOP per drive |
| `drive_first_downs` | First downs in drive |
| `drive_inside20` | Red zone drive indicator |
| `drive_ended_with_score` | Scoring drive indicator |
| `drive_start_yard_line` | Starting field position |
| `drive_end_yard_line` | Ending field position |

#### Advanced Analytics (for `live_plays` enrichment)
| Field | Description |
|-------|-------------|
| `air_epa` | EPA from air yards alone |
| `yac_epa` | EPA from yards after catch |
| `cp` | Completion probability |
| `cpoe` | Completion % over expected |
| `xpass` | Dropback probability |
| `xyac_epa` | Expected YAC EPA |

#### Win Probability
| Field | Description |
|-------|-------------|
| `wp` | Win probability at play start |
| `home_wp` / `away_wp` | Team-specific WP |
| `vegas_wpa` | Vegas-adjusted WPA |

#### Player Attribution (link plays to players)
| Field | Description |
|-------|-------------|
| `passer_player_id` | QB on play |
| `receiver_player_id` | Targeted receiver |
| `rusher_player_id` | Ball carrier |
| `interception_player_id` | INT defender |
| `sack_player_id` | Sack defender |
| `tackle_*_player_id` | Tacklers (up to 4) |

#### Pass Details
| Field | Description |
|-------|-------------|
| `air_yards` | Depth of target |
| `yards_after_catch` | YAC |
| `pass_length` | Short/Deep |
| `pass_location` | Left/Middle/Right |

#### Situation Context
| Field | Description |
|-------|-------------|
| `shotgun` | Shotgun formation |
| `no_huddle` | No-huddle indicator |
| `score_differential` | Game state margin |
| `goal_to_go` | Red zone situation |

---

## Data Field Inventory

### ESPN Live Game API (`/summary` endpoint)

#### Team Statistics
| ESPN Field | Description | Using? | Table |
|------------|-------------|--------|-------|
| `totalYards` | Total offensive yards | ✅ | `team_game_stats` |
| `netPassingYards` | Net passing yards | ✅ | `team_game_stats` |
| `rushingYards` | Rushing yards | ✅ | `team_game_stats` |
| `firstDowns` | Total first downs | ✅ | `team_game_stats` |
| `passingFirstDowns` | First downs via pass | ✅* | `team_game_stats` |
| `rushingFirstDowns` | First downs via rush | ✅* | `team_game_stats` |
| `penaltyFirstDowns` | First downs via penalty | ✅* | `team_game_stats` |
| `thirdDownEff` | 3rd down conversions | ✅ | `team_game_stats` |
| `fourthDownEff` | 4th down conversions | ✅ | `team_game_stats` |
| `redZoneAttempts` | Red zone efficiency | ✅ | `team_game_stats` |
| `turnovers` | Total turnovers | ✅ | `team_game_stats` |
| `totalPenaltiesYards` | Penalties count/yards | ✅ | `team_game_stats` |
| `possessionTime` | Time of possession | ✅ | `team_game_stats` |
| `completionAttempts` | Pass completions/attempts | ❌ | - |
| `yardsPerRushAttempt` | Yards per rush | ❌ | - |
| `yardsPerPass` | Yards per pass attempt | ❌ | - |
| `interceptions` | INTs thrown | ❌ | - |
| `fumblesLost` | Fumbles lost | ❌ | - |
| `sacks` | Sacks allowed | ❌ | - |
| `sacksYardsLost` | Sack yards lost | ❌ | - |
| `totalDrives` | Number of drives | ❌ | - |
| `totalPlays` | Total plays | ❌ | - |
| `yardsPerPlay` | Yards per play | ❌ | - |
| `defensiveTouchdowns` | Defensive TDs | ❌ | - |
| `passesDefended` | Passes defended | ❌ | - |

*Only in `game-stats-scraper`, not `live-games-scraper`

#### Play-by-Play Data
| ESPN Field | Description | Using? | Table |
|------------|-------------|--------|-------|
| `play.id` | Unique play ID | ✅ | `live_plays` |
| `play.text` | Play description | ✅ | `live_plays` |
| `play.type.text` | Play type (pass/rush/etc) | ✅ | `live_plays` |
| `play.statYardage` | Yards gained | ✅ | `live_plays` |
| `play.sequenceNumber` | Play number in drive | ✅ | `live_plays` |
| `play.period.number` | Quarter | ✅ | `live_plays` |
| `play.clock.displayValue` | Game clock | ✅ | `live_plays` |
| `play.start.down` | Down (1-4) | ✅ | `live_plays` |
| `play.start.distance` | Yards to go | ✅ | `live_plays` |
| `play.start.yardLine` | Yard line | ✅ | `live_plays` |
| `play.scoringPlay` | Is scoring play | ✅ | `live_plays` |
| `play.homeScore` | Home score after play | ✅ | `live_plays` |
| `play.awayScore` | Away score after play | ✅ | `live_plays` |
| `play.participants` | Players involved (IDs) | ❌ | - |
| `play.end.yardLine` | End yard line | ❌ | - |
| `play.expectedPoints` | EP at play start | ❌ | - |
| `play.wallclock` | Real-world time | ❌ | - |
| `play.start.team` | Possession team | ❌ | - |

#### Drive Data
| ESPN Field | Description | Using? | Table |
|------------|-------------|--------|-------|
| `drive.team.abbreviation` | Possession team | ✅ | `live_drives` |
| `drive.result` | Drive result code | ✅ | `live_drives` |
| `drive.displayResult` | Drive result text | ✅ | `live_drives` |
| `drive.yards` | Total yards | ✅ | `live_drives` |
| `drive.offensivePlays` | Play count | ✅ | `live_drives` |
| `drive.timeElapsed` | Time of possession | ✅ | `live_drives` |
| `drive.start.period` | Start quarter | ✅ | `live_drives` |
| `drive.start.clock` | Start time | ✅ | `live_drives` |
| `drive.start.yardLine` | Start position | ✅ | `live_drives` |
| `drive.start.text` | Start position text | ✅ | `live_drives` |
| `drive.end.*` | End position fields | ✅ | `live_drives` |
| `drive.isScore` | Scoring drive flag | ✅ | `live_drives` |
| `drive.description` | Drive summary | ✅ | `live_drives` |
| `drive.id` | ESPN internal ID | ❌ | - |
| `drive.penalties` | Penalties in drive | ❌ | - |

#### Game-Level Data
| ESPN Field | Description | Using? | Table |
|------------|-------------|--------|-------|
| `header.id` | Game ID | ✅ | `games` |
| `header.competitions.status` | Game status | ✅ | `games` |
| `header.competitions.competitors` | Team scores | ✅ | `games` |
| `competitors.linescores` | Quarter scores | ✅ | `games` |
| `status.displayClock` | Game clock | ✅ | `games` |
| `status.period` | Current quarter | ✅ | `games` |
| `drives.current` | Live situation | ✅ | `games` |
| `winprobability` | WP data points | ✅ | `win_probability` |
| `scoringPlays` | Scoring play list | ✅ | `scoring_plays` |
| `leaders` | Game leaders | ✅ | logged only |
| `injuries` | In-game injuries | ✅ | logged only |
| `gameInfo.venue` | Stadium info | ✅ | `stadiums` |
| `gameInfo.weather` | Weather conditions | ✅ | `game_weather` |
| `gameInfo.officials` | Referee crew | ✅ | `game_officials` |
| `gameInfo.attendance` | Attendance | ✅ | `games` |
| `boxscore.players` | Player stats | ✅ | `player_game_stats` |
| `pickcenter` / `odds` | Betting lines | ❌ | excluded |
| `predictor` | ESPN win model | ❌ | - |
| `news` / `article` | Game recap | ❌ | - |
| `videos` / `highlights` | Video links | ❌ | - |
| `standings` | Team standings | ❌ | - |
| `broadcasts` | TV/radio info | ❌ | - |

---

### nflverse Play-by-Play Data

#### Core Play Fields
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `game_id` | Game identifier | ✅ | `play_by_play` |
| `play_id` | Play identifier | ✅ | `play_by_play` |
| `season` | Season year | ✅ | `play_by_play` |
| `qtr` | Quarter | ✅ | `play_by_play` |
| `quarter_seconds_remaining` | Time in quarter | ✅ | `play_by_play` |
| `down` | Down (1-4) | ✅ | `play_by_play` |
| `ydstogo` | Yards to first down | ✅ | `play_by_play` |
| `yardline_100` | Field position | ✅ | `play_by_play` |
| `posteam` | Possession team | ✅ | `play_by_play` |
| `play_type` | Play type | ✅ | `play_by_play` |
| `desc` | Play description | ✅ | `play_by_play` |
| `yards_gained` | Yards on play | ✅ | `play_by_play` |
| `epa` | Expected points added | ✅ | `play_by_play` |
| `wpa` | Win probability added | ✅ | `play_by_play` |
| `success` | Successful play (EPA>0) | ✅ | `play_by_play` |

#### Drive Fields (NOT USING)
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `drive` | Drive number | ❌ | - |
| `fixed_drive` | Corrected drive number | ❌ | - |
| `fixed_drive_result` | Drive outcome | ❌ | - |
| `drive_play_count` | Plays in drive | ❌ | - |
| `drive_time_of_possession` | Drive TOP | ❌ | - |
| `drive_first_downs` | First downs in drive | ❌ | - |
| `drive_inside20` | Red zone drive | ❌ | - |
| `drive_ended_with_score` | Scoring drive | ❌ | - |
| `drive_start_yard_line` | Start position | ❌ | - |
| `drive_end_yard_line` | End position | ❌ | - |
| `drive_yards_penalized` | Penalty yards | ❌ | - |

#### Advanced Analytics
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `epa` | Expected points added | ✅ | `play_by_play` |
| `wpa` | Win probability added | ✅ | `play_by_play` |
| `success` | Successful play (EPA>0) | ✅ | `play_by_play` |
| `air_epa` | EPA from air yards | ❌ (commented) | - |
| `yac_epa` | EPA from YAC | ❌ (commented) | - |
| `comp_air_epa` | Completion air EPA | ❌ (commented) | - |
| `comp_yac_epa` | Completion YAC EPA | ❌ (commented) | - |
| `xyac_epa` | Expected YAC EPA | ❌ | - |
| `qb_epa` | QB credit EPA | ❌ | - |
| `cp` | Completion probability | ❌ | - |
| `cpoe` | Comp % over expected | ❌ | - |
| `xpass` | Dropback probability | ❌ | - |
| `pass_oe` | Pass rate over expected | ❌ | - |

#### Game-Level EPA Summaries (Calculated)
| Calculated Field | Description | Using? | Storage |
|------------------|-------------|--------|---------|
| `total_plays` | Total offensive plays | ✅ | logged |
| `total_epa` | Sum of EPA | ✅ | logged |
| `avg_epa_per_play` | EPA / plays | ✅ | logged |
| `passing_plays` | Pass play count | ✅ | logged |
| `passing_epa` | Pass EPA total | ✅ | logged |
| `rushing_plays` | Rush play count | ✅ | logged |
| `rushing_epa` | Rush EPA total | ✅ | logged |
| `success_rate` | % successful plays | ✅ | logged |
| `explosive_plays` | Plays 20+ yards | ✅ | logged |

#### Win Probability
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `wp` | Win probability | ❌ | - |
| `def_wp` | Defensive WP | ❌ | - |
| `home_wp` | Home team WP | ❌ (commented) | - |
| `away_wp` | Away team WP | ❌ (commented) | - |
| `vegas_wpa` | Vegas-adjusted WPA | ❌ | - |
| `home_wp_post` | Post-play home WP | ❌ | - |
| `away_wp_post` | Post-play away WP | ❌ | - |

#### Player Attribution (NOT USING)
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `passer_player_id` | QB ID | ❌ | - |
| `passer_player_name` | QB name | ❌ | - |
| `receiver_player_id` | Receiver ID | ❌ | - |
| `receiver_player_name` | Receiver name | ❌ | - |
| `rusher_player_id` | Rusher ID | ❌ | - |
| `rusher_player_name` | Rusher name | ❌ | - |
| `interception_player_id` | INT defender ID | ❌ | - |
| `sack_player_id` | Sacker ID | ❌ | - |
| `tackle_*_player_id` | Tackler IDs (1-4) | ❌ | - |
| `forced_fumble_player_*` | FF player IDs | ❌ | - |
| `fumble_recovery_*_player_id` | FR player IDs | ❌ | - |
| `penalty_player_id` | Penalized player | ❌ | - |

#### Pass Details (NOT USING)
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `air_yards` | Depth of target | ❌ | - |
| `yards_after_catch` | YAC | ❌ | - |
| `pass_length` | Short/Deep | ❌ | - |
| `pass_location` | Left/Middle/Right | ❌ | - |
| `complete_pass` | Completion flag | ❌ | - |
| `incomplete_pass` | Incompletion flag | ❌ | - |
| `interception` | INT flag | ❌ | - |
| `qb_scramble` | Scramble flag | ❌ | - |
| `qb_dropback` | Dropback flag | ❌ | - |

#### Situation Context (NOT USING)
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `shotgun` | Shotgun formation | ❌ | - |
| `no_huddle` | No-huddle flag | ❌ | - |
| `goal_to_go` | Goal-to-go flag | ❌ | - |
| `score_differential` | Score margin | ❌ | - |
| `half_seconds_remaining` | Time in half | ❌ | - |
| `game_seconds_remaining` | Time in game | ❌ | - |
| `posteam_timeouts_remaining` | Offense TOs | ❌ | - |
| `defteam_timeouts_remaining` | Defense TOs | ❌ | - |

#### Scoring/Conversion (NOT USING)
| nflverse Field | Description | Using? | Table |
|----------------|-------------|--------|-------|
| `touchdown` | TD flag | ❌ | - |
| `first_down_rush` | Rush first down | ❌ | - |
| `first_down_pass` | Pass first down | ❌ | - |
| `first_down_penalty` | Penalty first down | ❌ | - |
| `third_down_converted` | 3rd down conv | ❌ | - |
| `third_down_failed` | 3rd down fail | ❌ | - |
| `fourth_down_converted` | 4th down conv | ❌ | - |
| `fourth_down_failed` | 4th down fail | ❌ | - |
| `field_goal_result` | FG made/missed | ❌ | - |
| `extra_point_result` | XP result | ❌ | - |
| `two_point_conv_result` | 2PT result | ❌ | - |

---

### Implementation: Enhanced Analytics Scraper

Modify `advanced-analytics-scraper.js` to:

1. **Add drive fields** to play records:
```javascript
drive_number: play.drive || play.fixed_drive,
```

2. **Aggregate drives** from PBP data:
```javascript
// Group plays by drive, extract drive-level stats
const drives = aggregateDrives(plays)
await upsertBatch('live_drives', drives, ['game_id', 'drive_number'])
```

3. **Enrich existing plays** (UPDATE not INSERT for current season):
```javascript
// Match by game_id + play_number, add analytics
await upsertBatch('live_plays', enrichedPlays, ['game_id', 'play_number'])
```

4. **Historical backfill** (INSERT for past seasons):
```javascript
// Full insert for seasons without ESPN live data
await upsertBatch('live_plays', historicalPlays, ['game_id', 'play_number'])
```

---

---

## Complete Data Capture Implementation Plan

### Goal
Capture EVERY available data point from both ESPN and nflverse PBP:
1. **ESPN first** - During/after games (real-time or historical fetch)
2. **nflverse PBP on Tuesdays** - Enrich with analytics not available from ESPN
3. **Apply to both current season and historical backfill**

---

### Phase 1: ESPN Scraper Enhancements

#### 1.1 Team Statistics - Add Missing Fields
**File**: `scripts/utils/live-data-extractor.js` → `extractTeamStats()`
**File**: `scripts/scrapers/game-stats-scraper.js`

| Field to Add | ESPN Source | Target Column |
|--------------|-------------|---------------|
| `completionAttempts` | `boxscore.teams[].statistics` | `pass_completions`, `pass_attempts` |
| `yardsPerRushAttempt` | `boxscore.teams[].statistics` | `yards_per_rush` |
| `yardsPerPass` | `boxscore.teams[].statistics` | `yards_per_pass` |
| `interceptions` | `boxscore.teams[].statistics` | `interceptions_thrown` |
| `fumblesLost` | `boxscore.teams[].statistics` | `fumbles_lost` |
| `sacks` | `boxscore.teams[].statistics` | `sacks_allowed` |
| `sacksYardsLost` | `boxscore.teams[].statistics` | `sack_yards_lost` |
| `totalDrives` | `boxscore.teams[].statistics` | `total_drives` |
| `totalPlays` | `boxscore.teams[].statistics` | `total_plays` |
| `yardsPerPlay` | `boxscore.teams[].statistics` | `yards_per_play` |
| `defensiveTouchdowns` | `boxscore.teams[].statistics` | `defensive_tds` |
| `passesDefended` | `boxscore.teams[].statistics` | `passes_defended` |

**DB Migration Required**: Add new columns to `team_game_stats` table

#### 1.2 Play-by-Play - Add Missing Fields
**File**: `scripts/utils/live-data-extractor.js` → `extractPlays()`

| Field to Add | ESPN Source | Target Column |
|--------------|-------------|---------------|
| `participants` | `play.participants[].athlete.id` | `participant_ids` (JSON array) |
| `end.yardLine` | `play.end.yardLine` | `end_yard_line` |
| `expectedPoints` | `play.expectedPoints` | `expected_points` |
| `start.team` | `play.start.team.id` | `possession_team_id` (verify) |

**DB Migration Required**: Add columns to `live_plays` table

#### 1.3 Drive Data - Add Missing Fields
**File**: `scripts/utils/live-data-extractor.js` → `extractDrives()`

| Field to Add | ESPN Source | Target Column |
|--------------|-------------|---------------|
| `drive.id` | `drive.id` | `espn_drive_id` |
| `drive.penalties` | `drive.penalties` | `penalty_count` |

**DB Migration Required**: Add columns to `live_drives` table

#### 1.4 Game-Stats Scraper - Add --season Support
**File**: `scripts/scrapers/game-stats-scraper.js`

```javascript
// Replace line 40:
// const SEASON_YEAR = 2025
const args = process.argv.slice(2)
const seasonArg = args.find(a => a.startsWith('--season='))
const SEASON_YEAR = seasonArg ? parseInt(seasonArg.split('=')[1]) : new Date().getFullYear()
```

---

### Phase 2: nflverse PBP Scraper Enhancements

#### 2.1 Enable Commented-Out Fields
**File**: `scripts/scrapers/advanced-analytics-scraper.js`

Uncomment these fields (already in code but disabled):
- `air_epa`
- `yac_epa`
- `comp_air_epa`
- `comp_yac_epa`
- `home_wp`
- `away_wp`

#### 2.2 Add All Drive Fields
**Target Table**: `live_drives` (via aggregation) or `play_by_play` (per-play)

| nflverse Field | Purpose |
|----------------|---------|
| `drive` / `fixed_drive` | Drive number |
| `fixed_drive_result` | Drive outcome |
| `drive_play_count` | Plays in drive |
| `drive_time_of_possession` | Drive TOP |
| `drive_first_downs` | First downs |
| `drive_inside20` | Red zone flag |
| `drive_ended_with_score` | Scoring drive |
| `drive_start_yard_line` | Start position |
| `drive_end_yard_line` | End position |
| `drive_yards_penalized` | Penalty yards |

#### 2.3 Add All Advanced Analytics
| nflverse Field | Purpose |
|----------------|---------|
| `xyac_epa` | Expected YAC EPA |
| `qb_epa` | QB credit EPA |
| `cp` | Completion probability |
| `cpoe` | Comp % over expected |
| `xpass` | Dropback probability |
| `pass_oe` | Pass rate over expected |

#### 2.4 Add Win Probability Fields
| nflverse Field | Purpose |
|----------------|---------|
| `wp` | Win probability at start |
| `def_wp` | Defensive WP |
| `vegas_wpa` | Vegas-adjusted WPA |
| `home_wp_post` | Post-play home WP |
| `away_wp_post` | Post-play away WP |

#### 2.5 Add Player Attribution
| nflverse Field | Purpose |
|----------------|---------|
| `passer_player_id` | QB on play |
| `passer_player_name` | QB name |
| `receiver_player_id` | Receiver ID |
| `receiver_player_name` | Receiver name |
| `rusher_player_id` | Rusher ID |
| `rusher_player_name` | Rusher name |
| `interception_player_id` | INT defender |
| `sack_player_id` | Sacker ID |
| `tackle_*_player_id` (1-4) | Tacklers |
| `forced_fumble_player_*` | FF players |
| `fumble_recovery_*_player_id` | FR players |
| `penalty_player_id` | Penalized player |

#### 2.6 Add Pass Details
| nflverse Field | Purpose |
|----------------|---------|
| `air_yards` | Depth of target |
| `yards_after_catch` | YAC |
| `pass_length` | Short/Deep |
| `pass_location` | Left/Middle/Right |
| `complete_pass` | Completion flag |
| `incomplete_pass` | Incompletion flag |
| `interception` | INT flag |
| `qb_scramble` | Scramble flag |
| `qb_dropback` | Dropback flag |

#### 2.7 Add Situation Context
| nflverse Field | Purpose |
|----------------|---------|
| `shotgun` | Formation flag |
| `no_huddle` | Tempo flag |
| `goal_to_go` | Situation flag |
| `score_differential` | Game state |
| `half_seconds_remaining` | Clock |
| `game_seconds_remaining` | Clock |
| `posteam_timeouts_remaining` | Resources |
| `defteam_timeouts_remaining` | Resources |

#### 2.8 Add Scoring/Conversion Fields
| nflverse Field | Purpose |
|----------------|---------|
| `touchdown` | TD flag |
| `first_down_rush` | 1D type |
| `first_down_pass` | 1D type |
| `first_down_penalty` | 1D type |
| `third_down_converted` | Conversion |
| `third_down_failed` | Conversion |
| `fourth_down_converted` | Conversion |
| `fourth_down_failed` | Conversion |
| `field_goal_result` | FG outcome |
| `extra_point_result` | XP outcome |
| `two_point_conv_result` | 2PT outcome |

---

### Phase 3: Database Schema Updates

#### 3.1 `team_game_stats` - Add Columns
```sql
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_completions INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS pass_attempts INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_rush DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_pass DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS interceptions_thrown INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS fumbles_lost INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sacks_allowed INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS sack_yards_lost INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_drives INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS total_plays INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS yards_per_play DECIMAL(4,2);
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS defensive_tds INTEGER;
ALTER TABLE team_game_stats ADD COLUMN IF NOT EXISTS passes_defended INTEGER;
```

#### 3.2 `live_plays` - Add Analytics Columns
```sql
-- ESPN fields
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS participant_ids JSONB;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS end_yard_line INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS expected_points DECIMAL(5,2);

-- nflverse analytics
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS epa DECIMAL(6,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS wpa DECIMAL(6,4);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS success BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS air_epa DECIMAL(6,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS yac_epa DECIMAL(6,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS cp DECIMAL(4,3);
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS cpoe DECIMAL(5,2);

-- Player attribution
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS passer_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS passer_player_name TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS receiver_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS receiver_player_name TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS rusher_player_id TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS rusher_player_name TEXT;

-- Pass details
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS air_yards INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS yards_after_catch INTEGER;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS pass_length TEXT;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS pass_location TEXT;

-- Situation context
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS shotgun BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS no_huddle BOOLEAN;
ALTER TABLE live_plays ADD COLUMN IF NOT EXISTS score_differential INTEGER;
```

#### 3.3 `live_drives` - Add Analytics Columns
```sql
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS espn_drive_id TEXT;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS penalty_count INTEGER;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS first_downs INTEGER;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS is_red_zone BOOLEAN;
ALTER TABLE live_drives ADD COLUMN IF NOT EXISTS yards_penalized INTEGER;
```

---

### Phase 4: Workflow Implementation

#### 4.1 Current Season Workflow

```
GAME DAY (ESPN - Real-time)
├── live-games-scraper.js (every 30s during games)
│   ├── live_plays   → Basic play text + new ESPN fields
│   ├── live_drives  → Drive summaries from ESPN
│   └── games        → Scores, status, quarter scores

POST-GAME (ESPN - Same day)
├── game-stats-scraper.js (after final)
│   ├── team_game_stats → ALL ESPN team statistics
│   ├── player_game_stats → Box score stats
│   ├── game_officials → Referee crew
│   └── scoring_plays → Scoring play details

TUESDAY (nflverse PBP - Weekly enrichment)
├── advanced-analytics-scraper.js (enhanced)
│   ├── UPDATE live_plays SET epa, wpa, cpoe, air_yards, player IDs...
│   │   WHERE game_id = X AND play_number = Y
│   └── UPDATE live_drives with drive analytics from PBP
```

#### 4.2 Historical Backfill Workflow

```
HISTORICAL BACKFILL (One-time per season)

Step 1: ESPN Data First
├── game-stats-scraper.js --season=YYYY
│   ├── team_game_stats → ALL statistics
│   ├── player_game_stats → Box scores
│   ├── game_officials → Refs
│   ├── scoring_plays → Scoring plays
│   └── live_drives → Drive summaries (from /summary endpoint)

Step 2: nflverse PBP (Full insert for historical)
├── advanced-analytics-scraper.js --season=YYYY --historical
│   ├── INSERT live_plays → Full PBP with ALL fields
│   │   (Only for games without ESPN live_plays data)
│   └── UPSERT live_drives → Enrich with analytics
```

#### 4.3 Enhanced Scraper Logic

**advanced-analytics-scraper.js** - New behavior:

```javascript
// Check if plays exist for this game
const { count } = await supabase
  .from('live_plays')
  .select('*', { count: 'exact', head: true })
  .eq('game_id', gameId)

if (count > 0) {
  // Current season: UPDATE existing ESPN plays with analytics
  await enrichExistingPlays(gameId, pbpData)
} else {
  // Historical: INSERT full PBP data
  await insertHistoricalPlays(gameId, pbpData)
}

// Always aggregate and upsert drive data
await upsertDriveAnalytics(gameId, pbpData)
```

---

### Phase 5: Implementation Checklist

#### ESPN Scraper Updates
- [ ] Add --season flag to `game-stats-scraper.js`
- [ ] Add missing team stats fields to `extractTeamStats()`
- [ ] Add participant_ids, end_yard_line to `extractPlays()`
- [ ] Add espn_drive_id, penalties to `extractDrives()`
- [ ] Add drive extraction to `game-stats-scraper.js` for historical games

#### nflverse PBP Updates
- [ ] Add --season flag (if not present)
- [ ] Uncomment air_epa, yac_epa, home_wp, away_wp
- [ ] Add ALL drive fields to extraction
- [ ] Add ALL player attribution fields
- [ ] Add ALL pass detail fields
- [ ] Add ALL situation context fields
- [ ] Add ALL scoring/conversion fields
- [ ] Implement UPDATE vs INSERT logic for enrichment

#### Database Migrations
- [ ] Create migration for `team_game_stats` new columns
- [ ] Create migration for `live_plays` analytics columns
- [ ] Create migration for `live_drives` new columns
- [ ] Test migrations on dev database

#### Backfill Script
- [ ] Create `scripts/backfill-historical.js`
- [ ] Add resume capability (skip processed seasons/games)
- [ ] Add progress logging
- [ ] Add rate limiting (1 req/sec for ESPN)
- [ ] Add error handling and retry logic

---

### Phase 6: Execution Order

```bash
# 1. Run database migrations
npm run migrate

# 2. Update scrapers (code changes)

# 3. Test on current week
npm run scrape:game-stats -- --season=2025
npm run scrape:advanced-analytics -- --season=2025

# 4. Run historical backfill
node scripts/backfill-historical.js --start=2024 --end=2024  # Test one season
node scripts/backfill-historical.js --start=2020 --end=2023  # Recent seasons
node scripts/backfill-historical.js --start=2016 --end=2019  # NGS era
node scripts/backfill-historical.js --start=2012 --end=2015  # Snap counts era
node scripts/backfill-historical.js --start=1999 --end=2011  # Historical
```

---

## Estimated Time
- Full backfill (all scrapers): 4-8 hours
- Per season: ~10-20 minutes
- ESPN rate limiting: ~1 request/second

## Notes
- Run during off-peak hours to avoid DB load
- Playoffs included in nflverse data (`game_type = 'POST'`)
- Pro Bowl games may be excluded
- ESPN game IDs needed - must have games in database first
- Weather skipped for dome stadiums (no outdoor weather)
- Open-Meteo has historical data back to 1940
