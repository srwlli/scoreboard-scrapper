'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Game, Team } from '@/types/game'

interface GameCardProps {
  game: Game
  homeTeam: Team
  awayTeam: Team
  showWeek?: boolean
}

function getTeamLogoUrl(teamAbbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamAbbr.toLowerCase()}.png`
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

function formatGameTime(dateStr: string, timeStr: string | null): string {
  if (!timeStr) return 'TBD'

  // Combine date and time, parse as UTC, then format in Eastern
  const dateTimeStr = `${dateStr}T${timeStr}Z`
  const date = new Date(dateTimeStr)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York'
  }) + ' ET'
}

export function GameCard({ game, homeTeam, awayTeam, showWeek = false }: GameCardProps) {
  const isFinal = game.status === 'final'
  const isLive = game.status === 'in_progress'

  const awayWon = isFinal && (game.away_score ?? 0) > (game.home_score ?? 0)
  const homeWon = isFinal && (game.home_score ?? 0) > (game.away_score ?? 0)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
  }

  return (
    <Link href={`/game/${game.game_id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        {showWeek && (
          <div className="px-4 pt-3 pb-1 border-b text-xs text-muted-foreground">
            Week {game.week} • {formatGameDate(game.game_date)} • {formatGameTime(game.game_date, game.game_time)}
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Away Team */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                className="h-10 w-10"
                alt={awayTeam.team_name}
                src={getTeamLogoUrl(awayTeam.team_abbr)}
                onError={handleImageError}
              />
              <span className={`font-bold text-lg ${awayWon ? 'text-foreground' : isFinal ? 'text-muted-foreground' : ''}`}>
                {awayTeam.team_abbr}
              </span>
            </div>

            {/* Away Score */}
            <span className={`font-bold text-2xl w-10 text-center tabular-nums ${awayWon ? '' : isFinal ? 'text-muted-foreground' : ''}`}>
              {game.away_score ?? '-'}
            </span>

            {/* Status */}
            <div className="flex-shrink-0 text-center px-2 min-w-[80px]">
              {isFinal ? (
                <div>
                  <Badge variant="secondary" className="mb-1">FINAL</Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatGameDate(game.game_date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatGameTime(game.game_date, game.game_time)}
                  </p>
                </div>
              ) : isLive ? (
                <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
              ) : (
                <div>
                  <p className="text-sm font-medium">{formatGameDate(game.game_date)}</p>
                  <p className="text-xs text-muted-foreground">{formatGameTime(game.game_date, game.game_time)}</p>
                </div>
              )}
            </div>

            {/* Home Score */}
            <span className={`font-bold text-2xl w-10 text-center tabular-nums ${homeWon ? '' : isFinal ? 'text-muted-foreground' : ''}`}>
              {game.home_score ?? '-'}
            </span>

            {/* Home Team */}
            <div className="flex items-center gap-2 justify-end flex-shrink-0">
              <span className={`font-bold text-lg ${homeWon ? 'text-foreground' : isFinal ? 'text-muted-foreground' : ''}`}>
                {homeTeam.team_abbr}
              </span>
              <img
                className="h-10 w-10"
                alt={homeTeam.team_name}
                src={getTeamLogoUrl(homeTeam.team_abbr)}
                onError={handleImageError}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
