import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getGameDetails, getGameMetadata } from '@/lib/queries/game-queries'
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
import type { LiveGameState } from '@/types/game'

interface GamePageProps {
  params: Promise<{ gameId: string }>
}

// Normalize game ID to database format (espn-{id})
function normalizeGameId(gameId: string): string {
  return gameId.startsWith('espn-') ? gameId : `espn-${gameId}`
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params
  const metadata = await getGameMetadata(normalizeGameId(gameId))

  if (!metadata) {
    return {
      title: 'Game Not Found',
    }
  }

  const { game, homeTeam, awayTeam } = metadata
  const title = `${awayTeam.team_name} @ ${homeTeam.team_name} - Week ${game.week}, ${game.season}`

  return {
    title,
    description: `Game details and stats for ${awayTeam.team_name} vs ${homeTeam.team_name}, Week ${game.week} of the ${game.season} NFL season.`,
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params
  const data = await getGameDetails(normalizeGameId(gameId))

  if (!data) {
    notFound()
  }

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
    livePlays
  } = data

  // Create teams record for components that need team lookup
  const teams: Record<string, typeof homeTeam> = {
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
        yardLine: livePlays[0].yard_line
      }
    : null

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

        {/* Team Stats */}
        {(homeTeamStats || awayTeamStats) && (
          <TeamStatsCard
            homeStats={homeTeamStats}
            awayStats={awayTeamStats}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )}

        {/* Win Probability Chart and Live Plays Feed */}
        {(winProbability.length > 0 || livePlays.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {winProbability.length > 0 && (
              <WinProbabilityChart
                data={winProbability}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            )}
            {livePlays.length > 0 && (
              <LivePlaysCard
                plays={livePlays}
                teams={teams}
              />
            )}
          </div>
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

        {/* Data Source Footer */}
        <DataSourceFooter />
      </div>
    </main>
  )
}
