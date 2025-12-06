import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Game, Team } from '@/types/game'

interface GameHeaderProps {
  game: Game
  homeTeam: Team
  awayTeam: Team
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  })
}

export function GameHeader({ game, homeTeam, awayTeam }: GameHeaderProps) {
  const isFinal = game.status === 'final'
  const isLive = game.status === 'in_progress'
  const hasOT = game.home_ot_score !== null || game.away_ot_score !== null

  const awayWon = isFinal && (game.away_score ?? 0) > (game.home_score ?? 0)
  const homeWon = isFinal && (game.home_score ?? 0) > (game.away_score ?? 0)

  return (
    <div className="bg-gradient-to-r from-muted/50 via-background to-muted/50 rounded-lg p-6">
      {/* Status and Date */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <p className="text-sm text-muted-foreground">
          Week {game.week} • {formatGameDate(game.game_date)}
        </p>
        <div className="flex items-center gap-2">
          {isFinal ? (
            <Badge variant="secondary" className="text-sm">
              FINAL{hasOT ? ' OT' : ''}
            </Badge>
          ) : isLive ? (
            <Badge variant="destructive" className="animate-pulse text-sm">
              LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="text-sm">
              {game.game_time || 'TBD'} ET
            </Badge>
          )}
          {game.broadcast_network && (
            <Badge variant="outline" className="text-xs">
              {game.broadcast_network}
            </Badge>
          )}
        </div>
      </div>

      {/* Teams and Scores */}
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {/* Away Team */}
        <div className={`flex flex-col items-center text-center flex-1 ${awayWon ? 'font-semibold' : ''}`}>
          <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-2">
            <AvatarImage src={getTeamLogoUrl(awayTeam.team_id)} alt={awayTeam.team_name} />
            <AvatarFallback className="text-lg">{awayTeam.team_id}</AvatarFallback>
          </Avatar>
          <p className="text-sm md:text-base text-muted-foreground">{awayTeam.team_id}</p>
          <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
            {awayTeam.team_name}
          </p>
          <p className="text-3xl md:text-4xl font-bold tabular-nums mt-2">
            {game.away_score ?? '-'}
          </p>
        </div>

        {/* VS / @ */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-light text-muted-foreground">@</span>
        </div>

        {/* Home Team */}
        <div className={`flex flex-col items-center text-center flex-1 ${homeWon ? 'font-semibold' : ''}`}>
          <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-2">
            <AvatarImage src={getTeamLogoUrl(homeTeam.team_id)} alt={homeTeam.team_name} />
            <AvatarFallback className="text-lg">{homeTeam.team_id}</AvatarFallback>
          </Avatar>
          <p className="text-sm md:text-base text-muted-foreground">{homeTeam.team_id}</p>
          <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
            {homeTeam.team_name}
          </p>
          <p className="text-3xl md:text-4xl font-bold tabular-nums mt-2">
            {game.home_score ?? '-'}
          </p>
        </div>
      </div>

      {/* Quarter Scores Table */}
      {isFinal && (
        <div className="mt-6 pt-4 border-t max-w-md mx-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-left font-normal">Team</th>
                <th className="text-center font-normal">1</th>
                <th className="text-center font-normal">2</th>
                <th className="text-center font-normal">3</th>
                <th className="text-center font-normal">4</th>
                {hasOT && <th className="text-center font-normal">OT</th>}
                <th className="text-center font-normal">T</th>
              </tr>
            </thead>
            <tbody>
              <tr className={awayWon ? 'font-semibold' : ''}>
                <td className="py-1">{awayTeam.team_id}</td>
                <td className="text-center tabular-nums">{game.away_q1_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q2_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q3_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q4_score ?? '-'}</td>
                {hasOT && <td className="text-center tabular-nums">{game.away_ot_score ?? '-'}</td>}
                <td className="text-center tabular-nums font-semibold">{game.away_score ?? '-'}</td>
              </tr>
              <tr className={homeWon ? 'font-semibold' : ''}>
                <td className="py-1">{homeTeam.team_id}</td>
                <td className="text-center tabular-nums">{game.home_q1_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q2_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q3_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q4_score ?? '-'}</td>
                {hasOT && <td className="text-center tabular-nums">{game.home_ot_score ?? '-'}</td>}
                <td className="text-center tabular-nums font-semibold">{game.home_score ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
