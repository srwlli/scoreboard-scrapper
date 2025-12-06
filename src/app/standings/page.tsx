import { getStandings } from '@/lib/queries/standings-queries'
import { getAvailableSeasons } from '@/lib/queries/scoreboard-queries'
import { StandingsClient } from '@/components/standings/StandingsClient'

interface StandingsPageProps {
  searchParams: Promise<{ season?: string }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams
  const seasons = await getAvailableSeasons()
  const currentSeason = params.season ? parseInt(params.season) : seasons[0] || 2025
  const standings = await getStandings(currentSeason)

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <StandingsClient
        standings={standings}
        seasons={seasons}
        currentSeason={currentSeason}
      />
    </main>
  )
}
