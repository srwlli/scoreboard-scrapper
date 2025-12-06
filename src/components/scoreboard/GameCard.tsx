'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Game, Team } from '@/types/game'

interface GameCardProps {
  game: Game
  homeTeam: Team
  awayTeam: Team
  showWeek?: boolean
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'America/New_York'
  })
}

function formatGameTime(timeStr: string | null): string {
  if (!timeStr) return 'TBD'
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period} ET`
}

export function GameCard({ game, homeTeam, awayTeam, showWeek = false }: GameCardProps) {
  const isFinal = game.status === 'final'
  const isLive = game.status === 'in_progress'

  const awayWon = isFinal && (game.away_score ?? 0) > (game.home_score ?? 0)
  const homeWon = isFinal && (game.home_score ?? 0) > (game.away_score ?? 0)

  return (
    <Link href={`/game/${game.game_id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        {showWeek && (
          <div className="px-4 pt-3 pb-1 border-b text-xs text-muted-foreground">
            Week {game.week} • {formatGameDate(game.game_date)} • {formatGameTime(game.game_time)}
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            {/* Away Team Row */}
            <div className={`flex items-center justify-between ${awayWon ? 'font-semibold' : ''}`}>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getTeamLogoUrl(awayTeam.team_id)} alt={awayTeam.team_name} />
                  <AvatarFallback>{awayTeam.team_id}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{awayTeam.team_id}</span>
              </div>
              <span className="text-lg tabular-nums">
                {game.away_score ?? '-'}
              </span>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {isFinal ? (
                <Badge variant="secondary">FINAL</Badge>
              ) : isLive ? (
                <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
              ) : (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">{formatGameDate(game.game_date)}</div>
                  <div className="text-xs font-medium">{formatGameTime(game.game_time)}</div>
                </div>
              )}
            </div>

            {/* Home Team Row */}
            <div className={`flex items-center justify-between ${homeWon ? 'font-semibold' : ''}`}>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getTeamLogoUrl(homeTeam.team_id)} alt={homeTeam.team_name} />
                  <AvatarFallback>{homeTeam.team_id}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{homeTeam.team_id}</span>
              </div>
              <span className="text-lg tabular-nums">
                {game.home_score ?? '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
