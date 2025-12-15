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

          {/* Passing Section */}
          <StatRow
            label="Passing Yards"
            away={awayStats.passing_yards}
            home={homeStats.passing_yards}
            {...compareNum(awayStats.passing_yards, homeStats.passing_yards)}
          />
          {/* Completions/Attempts if available (WO-HISTORICAL-BACKFILL-001) */}
          {(awayStats.pass_completions != null || homeStats.pass_completions != null) && (
            <StatRow
              label="Comp/Att"
              away={`${awayStats.pass_completions || 0}/${awayStats.pass_attempts || 0}`}
              home={`${homeStats.pass_completions || 0}/${homeStats.pass_attempts || 0}`}
            />
          )}
          {(awayStats.yards_per_pass != null || homeStats.yards_per_pass != null) && (
            <StatRow
              label="Yds/Pass"
              away={(awayStats.yards_per_pass ?? 0).toFixed(1)}
              home={(homeStats.yards_per_pass ?? 0).toFixed(1)}
              {...compareNum(awayStats.yards_per_pass ?? 0, homeStats.yards_per_pass ?? 0)}
            />
          )}

          {/* Rushing Section */}
          <StatRow
            label="Rushing Yards"
            away={awayStats.rushing_yards}
            home={homeStats.rushing_yards}
            {...compareNum(awayStats.rushing_yards, homeStats.rushing_yards)}
          />
          {(awayStats.yards_per_rush != null || homeStats.yards_per_rush != null) && (
            <StatRow
              label="Yds/Rush"
              away={(awayStats.yards_per_rush ?? 0).toFixed(1)}
              home={(homeStats.yards_per_rush ?? 0).toFixed(1)}
              {...compareNum(awayStats.yards_per_rush ?? 0, homeStats.yards_per_rush ?? 0)}
            />
          )}

          {/* Efficiency Section */}
          {(awayStats.total_plays != null || homeStats.total_plays != null) && (
            <>
              <StatRow
                label="Total Plays"
                away={awayStats.total_plays || 0}
                home={homeStats.total_plays || 0}
              />
              <StatRow
                label="Yds/Play"
                away={(awayStats.yards_per_play ?? 0).toFixed(1)}
                home={(homeStats.yards_per_play ?? 0).toFixed(1)}
                {...compareNum(awayStats.yards_per_play ?? 0, homeStats.yards_per_play ?? 0)}
              />
            </>
          )}

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

          {/* Turnovers with breakdown (WO-HISTORICAL-BACKFILL-001) */}
          <StatRow
            label="Turnovers"
            away={awayStats.turnovers}
            home={homeStats.turnovers}
            {...compareNumLower(awayStats.turnovers, homeStats.turnovers)}
          />
          {(awayStats.interceptions_thrown != null || homeStats.interceptions_thrown != null) && (
            <>
              <StatRow
                label="INTs"
                away={awayStats.interceptions_thrown || 0}
                home={homeStats.interceptions_thrown || 0}
                {...compareNumLower(awayStats.interceptions_thrown ?? 0, homeStats.interceptions_thrown ?? 0)}
              />
              <StatRow
                label="Fumbles Lost"
                away={awayStats.fumbles_lost || 0}
                home={homeStats.fumbles_lost || 0}
                {...compareNumLower(awayStats.fumbles_lost ?? 0, homeStats.fumbles_lost ?? 0)}
              />
            </>
          )}

          {/* Sacks */}
          <StatRow
            label="Sacks"
            away={awayStats.sacks_allowed || 0}
            home={homeStats.sacks_allowed || 0}
            {...compareNumLower(awayStats.sacks_allowed || 0, homeStats.sacks_allowed || 0)}
          />
          {(awayStats.sack_yards_lost != null || homeStats.sack_yards_lost != null) && (
            <StatRow
              label="Sack Yds"
              away={`-${awayStats.sack_yards_lost || 0}`}
              home={`-${homeStats.sack_yards_lost || 0}`}
            />
          )}

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

          {/* Defense highlights (WO-HISTORICAL-BACKFILL-001) */}
          {(awayStats.defensive_tds != null && awayStats.defensive_tds > 0) ||
           (homeStats.defensive_tds != null && homeStats.defensive_tds > 0) ? (
            <StatRow
              label="Def TDs"
              away={awayStats.defensive_tds || 0}
              home={homeStats.defensive_tds || 0}
              {...compareNum(awayStats.defensive_tds ?? 0, homeStats.defensive_tds ?? 0)}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
