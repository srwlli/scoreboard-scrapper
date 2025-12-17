import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlayerStatLeader } from '@/lib/queries/teams-queries'

interface TeamStatLeadersCardProps {
  leaders: {
    passing: PlayerStatLeader[]
    rushing: PlayerStatLeader[]
    receiving: PlayerStatLeader[]
  }
}

function StatLeaderSection({
  title,
  players,
  statLabel
}: {
  title: string
  players: PlayerStatLeader[]
  statLabel: string
}) {
  if (players.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1">
        {players.map((player, idx) => (
          <div
            key={player.player_id}
            className="flex items-center gap-2 text-sm py-1"
          >
            <span className="w-4 text-muted-foreground">{idx + 1}.</span>
            <span className="flex-1 truncate">{player.full_name}</span>
            <span className="text-xs text-muted-foreground">{player.primary_position}</span>
            <span className="font-mono font-medium w-16 text-right">
              {player.stat_value.toLocaleString()} {statLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TeamStatLeadersCard({ leaders }: TeamStatLeadersCardProps) {
  const hasData = leaders.passing.length > 0 || leaders.rushing.length > 0 || leaders.receiving.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Stat Leaders</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">No stat data available</p>
        ) : (
          <div className="space-y-4">
            <StatLeaderSection
              title="Passing Yards"
              players={leaders.passing}
              statLabel="yds"
            />
            <StatLeaderSection
              title="Rushing Yards"
              players={leaders.rushing}
              statLabel="yds"
            />
            <StatLeaderSection
              title="Receiving Yards"
              players={leaders.receiving}
              statLabel="yds"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
