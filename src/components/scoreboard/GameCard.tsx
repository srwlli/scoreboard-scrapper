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
  homeRecord?: string
  awayRecord?: string
}

function getTeamLogoUrl(teamAbbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamAbbr.toLowerCase()}.png`
}

function formatGameDateTime(dateStr: string, timeStr: string | null): { date: string; time: string } {
  if (!timeStr) {
    // No time - just parse the date directly (for TBD games)
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric'
      }),
      time: 'TBD'
    }
  }

  // Times are stored in UTC - convert to Eastern for both date and time
  const dateTimeStr = `${dateStr}T${timeStr}Z`
  const utcDate = new Date(dateTimeStr)

  return {
    date: utcDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'America/New_York'
    }),
    time: utcDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    }) + ' ET'
  }
}

function formatGameDate(dateStr: string, timeStr: string | null): string {
  return formatGameDateTime(dateStr, timeStr).date
}

function formatGameTime(dateStr: string, timeStr: string | null): string {
  return formatGameDateTime(dateStr, timeStr).time
}

function formatQuarter(period: number | null): string {
  if (!period) return ''
  if (period === 5) return 'OT'
  return `Q${period}`
}

function formatDown(down: number | null, yardsToGo: number | null): string {
  if (!down) return ''
  const suffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th'
  return `${down}${suffix}${yardsToGo ? ` & ${yardsToGo}` : ''}`
}

export function GameCard({ game, homeTeam, awayTeam, showWeek = false, homeRecord, awayRecord }: GameCardProps) {
  const isFinal = game.status === 'final'
  const isLive = game.status === 'in_progress'
  const isScheduled = !isFinal && !isLive

  const awayWon = isFinal && (game.away_score ?? 0) > (game.home_score ?? 0)
  const homeWon = isFinal && (game.home_score ?? 0) > (game.away_score ?? 0)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
  }

  return (
    <Link href={`/game/${game.game_id.replace('espn-', '')}`}>
      <Card className={`hover:bg-accent/50 transition-colors cursor-pointer ${isLive ? 'border-2 border-red-500' : ''}`}>
        {showWeek && (
          <div className="px-4 pt-3 pb-1 border-b text-xs text-muted-foreground">
            Week {game.week} • {formatGameDate(game.game_date, game.game_time)} • {formatGameTime(game.game_date, game.game_time)}
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Away Team */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[50px]">
              <img
                className="h-8 w-8"
                alt={awayTeam.team_name}
                src={getTeamLogoUrl(awayTeam.team_abbr)}
                onError={handleImageError}
              />
              <span className={`font-bold text-sm ${awayWon ? 'text-foreground' : isFinal ? 'text-muted-foreground' : ''}`}>
                {awayTeam.team_abbr}
              </span>
              {awayRecord && (
                <span className="text-[10px] text-muted-foreground">{awayRecord}</span>
              )}
            </div>

            {/* Away Score */}
            <span className={`font-bold text-2xl w-10 text-center tabular-nums ${awayWon ? '' : isFinal ? 'text-muted-foreground' : ''}`}>
              {isScheduled ? '-' : (game.away_score ?? '-')}
            </span>

            {/* Status */}
            <div className="flex-shrink-0 text-center px-2 min-w-[80px]">
              {isFinal ? (
                <div>
                  <Badge variant="secondary" className="mb-1">FINAL</Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatGameDate(game.game_date, game.game_time)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatGameTime(game.game_date, game.game_time)}
                  </p>
                </div>
              ) : isLive ? (
                <div className="flex flex-col items-center gap-0.5">
                  {game.current_period === 2 && game.game_clock === '0:00' ? (
                    <span className="text-sm font-semibold text-orange-500">Halftime</span>
                  ) : game.game_clock === '0:00' && game.current_period === 4 ? (
                    <span className="text-sm font-semibold text-amber-500">Final</span>
                  ) : game.game_clock === '0:00' && game.current_period && game.current_period < 4 ? (
                    <span className="text-sm font-semibold text-amber-500">
                      End of {formatQuarter(game.current_period)}
                    </span>
                  ) : game.current_period && game.game_clock ? (
                    <span className="text-sm font-medium">
                      {formatQuarter(game.current_period)} {game.game_clock}
                    </span>
                  ) : null}
                  {game.current_down ? (
                    <span className="text-xs text-muted-foreground">
                      {formatDown(game.current_down, game.yards_to_go)}
                    </span>
                  ) : game.field_position ? (
                    <span className="text-xs text-muted-foreground italic">
                      Kickoff
                    </span>
                  ) : null}
                  {game.field_position && (
                    <span className="text-[10px] text-muted-foreground">
                      at {game.field_position}
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{formatGameDate(game.game_date, game.game_time)}</p>
                  <p className="text-xs text-muted-foreground">{formatGameTime(game.game_date, game.game_time)}</p>
                </div>
              )}
            </div>

            {/* Home Score */}
            <span className={`font-bold text-2xl w-10 text-center tabular-nums ${homeWon ? '' : isFinal ? 'text-muted-foreground' : ''}`}>
              {isScheduled ? '-' : (game.home_score ?? '-')}
            </span>

            {/* Home Team */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[50px]">
              <img
                className="h-8 w-8"
                alt={homeTeam.team_name}
                src={getTeamLogoUrl(homeTeam.team_abbr)}
                onError={handleImageError}
              />
              <span className={`font-bold text-sm ${homeWon ? 'text-foreground' : isFinal ? 'text-muted-foreground' : ''}`}>
                {homeTeam.team_abbr}
              </span>
              {homeRecord && (
                <span className="text-[10px] text-muted-foreground">{homeRecord}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
