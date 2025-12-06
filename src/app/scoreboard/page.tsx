import { ScoreboardClient } from '@/components/scoreboard/ScoreboardClient'
import {
  getTeams,
  getAvailableSeasons,
  getGamesForWeek,
  getMaxWeekForSeason,
} from '@/lib/queries/scoreboard-queries'
import { getCurrentWeek } from '@/types/game'

export default async function ScoreboardPage() {
  // Fetch initial data
  const [teams, seasons] = await Promise.all([
    getTeams(),
    getAvailableSeasons(),
  ])

  const currentSeason = seasons[0] || 2025
  const currentWeek = getCurrentWeek(currentSeason)
  const maxWeek = await getMaxWeekForSeason(currentSeason)
  const games = await getGamesForWeek(currentSeason, currentWeek)

  return (
    <ScoreboardClient
      initialTeams={teams}
      initialSeasons={seasons}
      initialGames={games}
      initialSeason={currentSeason}
      initialWeek={currentWeek}
      initialTeamId={null}
      initialMaxWeek={maxWeek}
    />
  )
}
