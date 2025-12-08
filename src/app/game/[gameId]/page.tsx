import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getGameDetails, getGameMetadata } from '@/lib/queries/game-queries'
import { GameDetailClient } from '@/components/game/GameDetailClient'

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

  return <GameDetailClient initialData={data} />
}
