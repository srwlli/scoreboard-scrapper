import { Card, CardContent } from '@/components/ui/card'
import type { Team } from '@/types/game'

interface TeamRecordCardProps {
  record: {
    wins: number
    losses: number
    ties: number
  }
  team: Team
}

export function TeamRecordCard({ record, team }: TeamRecordCardProps) {
  const { wins, losses, ties } = record
  const totalGames = wins + losses + ties
  const winPct = totalGames > 0 ? (wins / totalGames).toFixed(3).slice(1) : '.000'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {team.logo_url && (
            <img
              src={team.logo_url}
              alt={team.team_name}
              className="w-16 h-16 object-contain"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{team.team_name}</h2>
            <p className="text-muted-foreground">
              {team.conference} {team.division}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">
            {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
          </span>
          <span className="text-lg text-muted-foreground">({winPct})</span>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">{wins}</div>
            <div className="text-xs text-muted-foreground uppercase">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{losses}</div>
            <div className="text-xs text-muted-foreground uppercase">Losses</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-muted-foreground">{ties}</div>
            <div className="text-xs text-muted-foreground uppercase">Ties</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
