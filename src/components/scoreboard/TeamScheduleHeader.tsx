'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Game, Team } from '@/types/game'

interface TeamScheduleHeaderProps {
  team: Team
  games: Game[]
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function calculateRecord(games: Game[], teamId: string): string {
  let wins = 0, losses = 0, ties = 0

  for (const game of games) {
    if (game.status !== 'final') continue

    const isHome = game.home_team_id === teamId
    const teamScore = isHome ? game.home_score : game.away_score
    const oppScore = isHome ? game.away_score : game.home_score

    if (teamScore === null || oppScore === null) continue

    if (teamScore > oppScore) wins++
    else if (teamScore < oppScore) losses++
    else ties++
  }

  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`
}

export function TeamScheduleHeader({ team, games }: TeamScheduleHeaderProps) {
  const record = calculateRecord(games, team.team_id)

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getTeamLogoUrl(team.team_id)} alt={team.team_name} />
            <AvatarFallback className="text-lg">{team.team_id}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{team.team_name}</h2>
            <p className="text-lg text-muted-foreground">{record}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
