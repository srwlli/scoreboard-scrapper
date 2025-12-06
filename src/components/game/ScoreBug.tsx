import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Game, Team } from '@/types/game'

interface ScoreBugProps {
  game: Pick<Game,
    'game_id' | 'game_date' | 'game_time' | 'status' | 'broadcast_network' | 'overtime' |
    'home_score' | 'away_score' |
    'home_q1_score' | 'home_q2_score' | 'home_q3_score' | 'home_q4_score' | 'home_ot_score' |
    'away_q1_score' | 'away_q2_score' | 'away_q3_score' | 'away_q4_score' | 'away_ot_score'
  >
  homeTeam: Team
  awayTeam: Team
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

export function ScoreBug({ game, homeTeam, awayTeam }: ScoreBugProps) {
  const isFinal = game.status === 'final'
  const isLive = game.status === 'in_progress'
  const hasOT = game.overtime === true

  const awayWon = isFinal && (game.away_score ?? 0) > (game.home_score ?? 0)
  const homeWon = isFinal && (game.home_score ?? 0) > (game.away_score ?? 0)

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      {/* Status */}
      <div className="flex justify-center mb-4">
        {isFinal ? (
          <Badge variant="secondary">FINAL{hasOT ? ' OT' : ''}</Badge>
        ) : isLive ? (
          <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
        ) : (
          <Badge variant="outline">
            {game.game_date} {game.game_time || 'TBD'}
          </Badge>
        )}
        {game.broadcast_network && (
          <span className="ml-2 text-xs text-muted-foreground">
            {game.broadcast_network}
          </span>
        )}
      </div>

      {/* Teams and Scores */}
      <div className="space-y-3">
        {/* Away Team */}
        <div className={`flex items-center justify-between ${awayWon ? 'font-semibold' : ''}`}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getTeamLogoUrl(awayTeam.team_id)} alt={awayTeam.team_name} />
              <AvatarFallback>{awayTeam.team_id}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{awayTeam.team_name}</p>
              <p className="text-xs text-muted-foreground">{awayTeam.team_id}</p>
            </div>
          </div>
          <span className="text-2xl tabular-nums">{game.away_score ?? '-'}</span>
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWon ? 'font-semibold' : ''}`}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getTeamLogoUrl(homeTeam.team_id)} alt={homeTeam.team_name} />
              <AvatarFallback>{homeTeam.team_id}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{homeTeam.team_name}</p>
              <p className="text-xs text-muted-foreground">{homeTeam.team_id}</p>
            </div>
          </div>
          <span className="text-2xl tabular-nums">{game.home_score ?? '-'}</span>
        </div>
      </div>

      {/* Quarter Scores */}
      {isFinal && (
        <div className="mt-4 pt-4 border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-normal">Team</th>
                <th className="text-center font-normal w-10">1</th>
                <th className="text-center font-normal w-10">2</th>
                <th className="text-center font-normal w-10">3</th>
                <th className="text-center font-normal w-10">4</th>
                {hasOT && <th className="text-center font-normal w-10">OT</th>}
                <th className="text-center font-normal w-12">T</th>
              </tr>
            </thead>
            <tbody>
              <tr className={awayWon ? 'font-semibold' : ''}>
                <td>{awayTeam.team_id}</td>
                <td className="text-center tabular-nums">{game.away_q1_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q2_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q3_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.away_q4_score ?? '-'}</td>
                {hasOT && <td className="text-center tabular-nums">{game.away_ot_score ?? '-'}</td>}
                <td className="text-center tabular-nums">{game.away_score ?? '-'}</td>
              </tr>
              <tr className={homeWon ? 'font-semibold' : ''}>
                <td>{homeTeam.team_id}</td>
                <td className="text-center tabular-nums">{game.home_q1_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q2_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q3_score ?? '-'}</td>
                <td className="text-center tabular-nums">{game.home_q4_score ?? '-'}</td>
                {hasOT && <td className="text-center tabular-nums">{game.home_ot_score ?? '-'}</td>}
                <td className="text-center tabular-nums">{game.home_score ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
