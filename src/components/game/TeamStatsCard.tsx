import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamGameStats, Team } from '@/types/game'
import { formatPossession } from '@/types/game'

interface TeamStatsCardProps {
  homeStats: TeamGameStats | null
  awayStats: TeamGameStats | null
  homeTeam: Team
  awayTeam: Team
}

interface StatRowProps {
  label: string
  away: string | number
  home: string | number
  awayHighlight?: boolean
  homeHighlight?: boolean
}

function StatRow({ label, away, home, awayHighlight, homeHighlight }: StatRowProps) {
  return (
    <div className="flex items-center py-2 border-b last:border-b-0">
      <span className={`flex-1 text-right tabular-nums ${awayHighlight ? 'font-semibold text-primary' : ''}`}>
        {away}
      </span>
      <span className="w-32 text-center text-sm text-muted-foreground px-2">
        {label}
      </span>
      <span className={`flex-1 text-left tabular-nums ${homeHighlight ? 'font-semibold text-primary' : ''}`}>
        {home}
      </span>
    </div>
  )
}

export function TeamStatsCard({ homeStats, awayStats, homeTeam, awayTeam }: TeamStatsCardProps) {
  if (!homeStats || !awayStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team statistics unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const compareNum = (a: number, b: number) => ({
    awayHighlight: a > b,
    homeHighlight: b > a
  })

  const compareNumLower = (a: number, b: number) => ({
    awayHighlight: a < b,
    homeHighlight: b < a
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team Headers */}
        <div className="flex items-center mb-4 pb-2 border-b">
          <span className="flex-1 text-right font-semibold">{awayTeam.team_id}</span>
          <span className="w-32 text-center text-sm text-muted-foreground">vs</span>
          <span className="flex-1 text-left font-semibold">{homeTeam.team_id}</span>
        </div>

        {/* Stats */}
        <div className="space-y-0">
          <StatRow
            label="Total Yards"
            away={awayStats.total_yards}
            home={homeStats.total_yards}
            {...compareNum(awayStats.total_yards, homeStats.total_yards)}
          />
          <StatRow
            label="Passing Yards"
            away={awayStats.passing_yards}
            home={homeStats.passing_yards}
            {...compareNum(awayStats.passing_yards, homeStats.passing_yards)}
          />
          <StatRow
            label="Rushing Yards"
            away={awayStats.rushing_yards}
            home={homeStats.rushing_yards}
            {...compareNum(awayStats.rushing_yards, homeStats.rushing_yards)}
          />
          <StatRow
            label="First Downs"
            away={awayStats.first_downs}
            home={homeStats.first_downs}
            {...compareNum(awayStats.first_downs, homeStats.first_downs)}
          />
          {/* First Down Breakdown (WO-GAME-DETAILS-UI-001) */}
          {(awayStats.passing_first_downs > 0 || homeStats.passing_first_downs > 0) && (
            <>
              <StatRow
                label="Passing 1st"
                away={awayStats.passing_first_downs || 0}
                home={homeStats.passing_first_downs || 0}
              />
              <StatRow
                label="Rushing 1st"
                away={awayStats.rushing_first_downs || 0}
                home={homeStats.rushing_first_downs || 0}
              />
              <StatRow
                label="Penalty 1st"
                away={awayStats.penalty_first_downs || 0}
                home={homeStats.penalty_first_downs || 0}
              />
            </>
          )}
          <StatRow
            label="3rd Down"
            away={`${awayStats.third_down_conversions}/${awayStats.third_down_attempts}`}
            home={`${homeStats.third_down_conversions}/${homeStats.third_down_attempts}`}
          />
          <StatRow
            label="4th Down"
            away={`${awayStats.fourth_down_conversions}/${awayStats.fourth_down_attempts}`}
            home={`${homeStats.fourth_down_conversions}/${homeStats.fourth_down_attempts}`}
          />
          <StatRow
            label="Red Zone"
            away={`${awayStats.red_zone_scores}/${awayStats.red_zone_attempts}`}
            home={`${homeStats.red_zone_scores}/${homeStats.red_zone_attempts}`}
          />
          <StatRow
            label="Turnovers"
            away={awayStats.turnovers}
            home={homeStats.turnovers}
            {...compareNumLower(awayStats.turnovers, homeStats.turnovers)}
          />
          <StatRow
            label="Penalties"
            away={`${awayStats.penalties}-${awayStats.penalty_yards}`}
            home={`${homeStats.penalties}-${homeStats.penalty_yards}`}
          />
          <StatRow
            label="Possession"
            away={formatPossession(awayStats.time_of_possession_seconds)}
            home={formatPossession(homeStats.time_of_possession_seconds)}
            {...compareNum(awayStats.time_of_possession_seconds, homeStats.time_of_possession_seconds)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
