import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getGameDetails, getGameMetadata } from '@/lib/queries/game-queries'
import { GameHeader } from '@/components/game/GameHeader'
import { ScoreBug } from '@/components/game/ScoreBug'
import { TeamStatsCard } from '@/components/game/TeamStatsCard'
import { ScoringPlays } from '@/components/game/ScoringPlays'
import { TopEPAPlays } from '@/components/game/TopEPAPlays'
import { PlayerStatsCard } from '@/components/game/PlayerStatsCard'
import { SnapCountsCard } from '@/components/game/SnapCountsCard'
import { NGSStatsCard } from '@/components/game/NGSStatsCard'
import { AdvancedStatsCard } from '@/components/game/AdvancedStatsCard'
import { VenueCard } from '@/components/game/VenueCard'
import { WeatherCard } from '@/components/game/WeatherCard'
import { DataSourceFooter } from '@/components/game/DataSourceFooter'

interface GamePageProps {
  params: Promise<{ gameId: string }>
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params
  const metadata = await getGameMetadata(gameId)

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
  const data = await getGameDetails(gameId)

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
    advancedStats
  } = data

  // Create teams record for TopEPAPlays
  const teams: Record<string, typeof homeTeam> = {
    [homeTeam.team_id]: homeTeam,
    [awayTeam.team_id]: awayTeam
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Game Header - Full Width */}
      <GameHeader
        game={game}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Score Bug and Game Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScoreBug
              game={game}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </div>
          <div className="space-y-4">
            {stadium && <VenueCard stadium={stadium} attendance={game.attendance} />}
            {weather && <WeatherCard weather={weather} />}
          </div>
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
