# DELIVERABLES: video-links

**Project**: scrapper
**Feature**: video-links
**Workorder**: WO-VIDEO-LINKS-001
**Status**: 🚧 Not Started
**Generated**: 2025-12-11

---

## Executive Summary

**Goal**: TBD

**Description**: TBD

---

## Implementation Phases

### Phase 1: Database & Types Setup

**Description**: Create database schema and TypeScript interfaces for video data

**Estimated Duration**: TBD

**Deliverables**:
- game_videos table created in Supabase
- GameVideo interface added to types
- Environment variable documented

### Phase 2: YouTube API Integration

**Description**: Build YouTube API client and server-side data fetching

**Estimated Duration**: TBD

**Deliverables**:
- YouTube client with search functionality
- Supabase queries for video CRUD
- API route returning video data

### Phase 3: UI Implementation

**Description**: Create VideoCard component and integrate into game detail page

**Estimated Duration**: TBD

**Deliverables**:
- VideoCard component with embed and thumbnail
- Video section visible on game detail page

### Phase 4: Batch Scraper & Testing

**Description**: Build scraper for bulk processing and verify end-to-end flow

**Estimated Duration**: TBD

**Deliverables**:
- Working scraper script
- Videos populated for test games
- End-to-end verification complete


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

- [ ] [SETUP-001] Create game_videos database migration
- [ ] [SETUP-002] Add GameVideo interface to types
- [ ] [SETUP-003] Add YOUTUBE_API_KEY to environment variables
- [ ] [API-001] Create YouTube API client with team nickname mapping
- [ ] [API-002] Create video queries for Supabase
- [ ] [API-003] Create API route for fetching game videos
- [ ] [UI-001] Create VideoCard component with YouTube embed
- [ ] [UI-002] Integrate VideoCard into GameDetailClient
- [ ] [SCRAPER-001] Create batch video scraper script
- [ ] [TEST-001] Test YouTube API integration manually
- [ ] [TEST-002] Verify VideoCard renders correctly

---

## Files Created/Modified

- **src/lib/youtube.ts** - YouTube API client with search and team nickname mapping
- **src/components/game/VideoCard.tsx** - Video embed component with thumbnail fallback
- **src/app/api/videos/[gameId]/route.ts** - API route for fetching video data with caching
- **scripts/scrape-videos.ts** - Batch scraper for populating video data
- **supabase/migrations/add_game_videos.sql** - Database migration for game_videos table
- **src/types/game.ts** - Add GameVideo interface and update GameDetailData
- **src/lib/queries/game-queries.ts** - Add getGameVideos query and include in getGameDetails
- **src/components/game/GameDetailClient.tsx** - Add VideoCard to layout

---

## Success Criteria

- No success criteria defined

---

## Notes

*This deliverables report was automatically generated from plan.json.*
*Use `/update-deliverables` to populate metrics from git history after implementation.*

**Last Updated**: 2025-12-11
