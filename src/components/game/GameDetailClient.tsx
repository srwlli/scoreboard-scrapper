'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GameHeader } from '@/components/game/GameHeader'
import { TeamStatsCard } from '@/components/game/TeamStatsCard'
import { ScoringPlays } from '@/components/game/ScoringPlays'
import { TopEPAPlays } from '@/components/game/TopEPAPlays'
import { PlayerStatsCard } from '@/components/game/PlayerStatsCard'
import { SnapCountsCard } from '@/components/game/SnapCountsCard'
import { GameRosterCard } from '@/components/game/GameRosterCard'
import { NGSStatsCard } from '@/components/game/NGSStatsCard'
import { AdvancedStatsCard } from '@/components/game/AdvancedStatsCard'
import { VenueCard } from '@/components/game/VenueCard'
import { WeatherCard } from '@/components/game/WeatherCard'
import { DataSourceFooter } from '@/components/game/DataSourceFooter'
import { WinProbabilityChart } from '@/components/game/WinProbabilityChart'
import { LivePlaysCard } from '@/components/game/LivePlaysCard'
import { DrivesSummaryCard } from '@/components/game/DrivesSummaryCard'
import { PlayByPlayCard } from '@/components/game/PlayByPlayCard'
// Game Details Enhancements (WO-GAME-DETAILS-UI-001)
import { OfficialsCard } from '@/components/game/OfficialsCard'
import { CoinTossCard } from '@/components/game/CoinTossCard'
import { GameRecapCard } from '@/components/game/GameRecapCard'
import { HeadToHeadCard } from '@/components/game/HeadToHeadCard'
import type { GameDetailData } from '@/lib/queries/game-queries'
import type { LiveGameState, Team } from '@/types/game'

interface GameDetailClientProps {
  initialData: GameDetailData
}

export function GameDetailClient({ initialData }: GameDetailClientProps) {
  const [data, setData] = useState(initialData)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const {
    game,
    homeTeam,
    awayTeam,
    stadium,
    weather,
    homeTeamStats,
    awayTeamStats,
    playerStats,
    scoringPlays,
    snapCounts,
    playByPlay,
    ngsPassing,
    ngsRushing,
    ngsReceiving,
    advancedStats,
    gameRosters,
    winProbability,
    livePlays,
    // Game Details Enhancements (WO-GAME-DETAILS-UI-001)
    officials,
    prediction,
    recap,
    headToHead
  } = data

  // Create teams record for components that need team lookup
  const teams: Record<string, Team> = {
    [homeTeam.team_id]: homeTeam,
    [awayTeam.team_id]: awayTeam
  }

  // Extract live game state from most recent live play
  const liveState: LiveGameState | null = game.status === 'in_progress' && livePlays.length > 0
    ? {
        quarter: livePlays[0].quarter,
        gameClock: livePlays[0].game_clock,
        possession: livePlays[0].possession_team_id,
        down: livePlays[0].down,
        yardsToGo: livePlays[0].yards_to_go,
        yardLine: livePlays[0].yard_line,
        yardLineSide: livePlays[0].yard_line_side
      }
    : null

  const fetchGameData = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${game.game_id.replace('espn-', '')}`)
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }, [game.game_id])

  // Real-time subscription for live game updates
  useEffect(() => {
    const isLive = game.status === 'in_progress'
    if (!isLive) return

    const supabase = createClient()

    // Subscribe to game updates
    const channel = supabase
      .channel(`game-${game.game_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `game_id=eq.${game.game_id}`
        },
        () => {
          fetchGameData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_plays',
          filter: `game_id=eq.${game.game_id}`
        },
        () => {
          fetchGameData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scoring_plays',
          filter: `game_id=eq.${game.game_id}`
        },
        () => {
          fetchGameData()
        }
      )
      .subscribe()

    // Polling fallback every 30 seconds
    const interval = setInterval(() => {
      fetchGameData()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [game.game_id, game.status, fetchGameData])

  return (
    <main className="min-h-screen bg-background">
      {/* Game Header - Full Width */}
      <GameHeader
        game={game}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        liveState={liveState}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Venue and Weather Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stadium && <VenueCard stadium={stadium} attendance={game.attendance} />}
          {weather && <WeatherCard weather={weather} />}
        </div>

        {/* Game Info Section (WO-GAME-DETAILS-UI-001) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {officials && officials.length > 0 && (
            <OfficialsCard officials={officials} />
          )}
          {(game.coin_toss_winner_team_id || game.coin_toss_decision) && (
            <CoinTossCard game={game} homeTeam={homeTeam} awayTeam={awayTeam} />
          )}
          {headToHead && (
            <HeadToHeadCard headToHead={headToHead} homeTeam={homeTeam} awayTeam={awayTeam} />
          )}
          {recap && (
            <GameRecapCard recap={recap} />
          )}
        </div>

        {/* Team Stats */}
        {(homeTeamStats || awayTeamStats) && (
          <TeamStatsCard
            homeStats={homeTeamStats}
            awayStats={awayTeamStats}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* Win Probability Chart - Full Width */}
        {winProbability.length > 0 && (
          <WinProbabilityChart
            data={winProbability}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* Live Plays Feed (for live games) */}
        {livePlays.length > 0 && game.status === 'in_progress' && (
          <LivePlaysCard
            plays={livePlays.slice(0, 20)}
            teams={teams}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* Play-by-Play from nflverse data (completed games) */}
        {playByPlay.length > 0 && (
          <PlayByPlayCard
            plays={playByPlay}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* Drive Summary from live plays (live games only) */}
        {livePlays.length > 0 && game.status === 'in_progress' && (
          <DrivesSummaryCard
            plays={livePlays}
            teams={teams}
          />
        )}

        {/* Scoring Plays and Top EPA Plays Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoringPlays
            plays={scoringPlays}
            teams={teams}
          />
          <TopEPAPlays
            plays={playByPlay}
            teams={teams}
          />
        </div>

        {/* Player Stats Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Player Statistics</h2>

          {/* Main Player Stats */}
          <PlayerStatsCard
            playerStats={playerStats}
            homeTeamId={homeTeam.team_id}
            awayTeamId={awayTeam.team_id}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          {/* Snap Counts */}
          <SnapCountsCard
            snapCounts={snapCounts}
            homeTeamId={homeTeam.team_id}
            awayTeamId={awayTeam.team_id}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />

          {/* Game Roster */}
          <GameRosterCard
            rosters={gameRosters}
            homeTeamId={homeTeam.team_id}
            awayTeamId={awayTeam.team_id}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </div>

        {/* Advanced Analytics Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NGS Stats */}
            <NGSStatsCard
              passing={ngsPassing}
              rushing={ngsRushing}
              receiving={ngsReceiving}
              homeTeamId={homeTeam.team_id}
              awayTeamId={awayTeam.team_id}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />

            {/* Advanced Stats */}
            <AdvancedStatsCard
              stats={advancedStats}
              homeTeamId={homeTeam.team_id}
              awayTeamId={awayTeam.team_id}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </div>
        </div>

        {/* Data Source Footer with Last Updated */}
        <DataSourceFooter />

        {game.status === 'in_progress' && (
          <div className="text-center text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </main>
  )
}
