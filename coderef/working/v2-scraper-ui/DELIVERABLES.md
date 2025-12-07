# DELIVERABLES: v2-scraper-ui

**Project**: scrapper
**Feature**: v2-scraper-ui
**Workorder**: WO-V2-SCRAPER-UI-001
**Status**: 🚧 Not Started
**Generated**: 2025-12-07

---

## Executive Summary

**Goal**: Display all 180+ live game data points captured by the v2 scraper in the existing Next.js game detail page UI, maintaining consistent styling with existing components

**Description**: Add Win Probability Chart and Live Plays Feed components to the existing game detail page, integrating data from the new win_probability and live_plays tables created by the live-scraper-v2 backend

---

## Implementation Phases

### Phase 1: Data Layer Foundation

**Description**: Add TypeScript interfaces and Supabase query functions

**Estimated Duration**: TBD

**Deliverables**:
- WinProbability and LivePlay TypeScript interfaces
- getWinProbability() and getLivePlays() query functions
- Updated GameDetailData interface

### Phase 2: Component Development

**Description**: Create new UI components matching existing style patterns

**Estimated Duration**: TBD

**Deliverables**:
- WinProbabilityChart.tsx - SVG line chart component
- LivePlaysCard.tsx - Play feed component
- GameHeader.tsx updates for live state

### Phase 3: Page Integration

**Description**: Integrate components into game detail page

**Estimated Duration**: TBD

**Deliverables**:
- Data fetching in page.tsx
- Component placement in layout
- Props wiring for all new components


---

## Metrics

### Code Changes
- **Lines of Code Added**: TBD
- **Lines of Code Deleted**: TBD
- **Net LOC**: TBD
- **Files Modified**: TBD

### Commit Activity
- **Total Commits**: TBD
- **First Commit**: TBD
- **Last Commit**: TBD
- **Contributors**: TBD

### Time Investment
- **Days Elapsed**: TBD
- **Hours Spent (Wall Clock)**: TBD

---

## Task Completion Checklist

- [ ] [TYPES-001] Add WinProbability interface to game.ts
- [ ] [TYPES-002] Add LivePlay interface to game.ts
- [ ] [QUERY-001] Add getWinProbability() query function
- [ ] [QUERY-002] Add getLivePlays() query function
- [ ] [QUERY-003] Update GameDetailData interface to include new data
- [ ] [COMP-001] Create WinProbabilityChart component
- [ ] [COMP-002] Create LivePlaysCard component
- [ ] [COMP-003] Update GameHeader with live game state
- [ ] [PAGE-001] Update page.tsx to fetch new data
- [ ] [PAGE-002] Add WinProbabilityChart to page layout
- [ ] [PAGE-003] Add LivePlaysCard to page layout
- [ ] [PAGE-004] Pass live state props to GameHeader

---

## Files Created/Modified

- **src/components/game/WinProbabilityChart.tsx** - SVG line chart component displaying win probability over time
- **src/components/game/LivePlaysCard.tsx** - Scrollable play-by-play feed component
- **src/lib/queries/game-queries.ts** - Add getWinProbability() and getLivePlays() query functions
- **src/types/game.ts** - Add WinProbability and LivePlay TypeScript interfaces
- **src/app/game/[gameId]/page.tsx** - Import and render new components, update data fetching
- **src/components/game/GameHeader.tsx** - Add live game state display (clock, possession, down/distance)

---

## Success Criteria

- WinProbabilityChart displays all WP data points as smooth line
- LivePlaysCard shows most recent 50 plays with proper formatting
- GameHeader shows clock/possession for in-progress games
- All components render without errors
- Empty states handled gracefully

---

## Notes

*This deliverables report was automatically generated from plan.json.*
*Use `/update-deliverables` to populate metrics from git history after implementation.*

**Last Updated**: 2025-12-07
