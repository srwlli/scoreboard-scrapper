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

  // Use first available season from DB, or 2025 as default
  const currentSeason = seasons[0] || 2025
  const calculatedWeek = getCurrentWeek(currentSeason)
  const maxWeek = await getMaxWeekForSeason(currentSeason)

  // Try current calculated week first
  let games = await getGamesForWeek(currentSeason, calculatedWeek)
  let currentWeek = calculatedWeek

  // If no games for current week, fall back to max available week
  if (games.length === 0 && maxWeek > 0 && maxWeek !== calculatedWeek) {
    games = await getGamesForWeek(currentSeason, maxWeek)
    currentWeek = maxWeek
  }

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
