import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GameHeadToHead, Team } from '@/types/game'

interface HeadToHeadCardProps {
  headToHead: GameHeadToHead | null
  homeTeam: Team
  awayTeam: Team
}

export function HeadToHeadCard({ headToHead, homeTeam, awayTeam }: HeadToHeadCardProps) {
  if (!headToHead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Head to Head</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Historical matchup data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const totalGames = headToHead.home_all_time_wins + headToHead.away_all_time_wins + headToHead.all_time_ties

  // Determine series leader
  const getSeriesLeader = () => {
    if (headToHead.home_all_time_wins > headToHead.away_all_time_wins) {
      return homeTeam.team_id
    } else if (headToHead.away_all_time_wins > headToHead.home_all_time_wins) {
      return awayTeam.team_id
    }
    return 'Tied'
  }

  const seriesLeader = getSeriesLeader()

  // Format streak
  const getStreakDisplay = () => {
    if (!headToHead.current_streak_team_id || headToHead.current_streak_count === 0) {
      return null
    }
    return `${headToHead.current_streak_team_id} ${headToHead.current_streak_count}W`
  }

  const streak = getStreakDisplay()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Head to Head</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All-time Record */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">All-time Record</span>
            <span className="font-medium">{totalGames} games</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{homeTeam.team_id}</span>
            <span className="text-xl font-bold tabular-nums">
              {headToHead.home_all_time_wins} - {headToHead.away_all_time_wins}
              {headToHead.all_time_ties > 0 && ` - ${headToHead.all_time_ties}`}
            </span>
            <span className="font-semibold">{awayTeam.team_id}</span>
          </div>
        </div>

        {/* Series Leader */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Series Leader</span>
          <Badge variant={seriesLeader === 'Tied' ? 'outline' : 'default'}>
            {seriesLeader}
          </Badge>
        </div>

        {/* Current Streak */}
        {streak && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <Badge variant="secondary">{streak}</Badge>
          </div>
        )}

        {/* Last Meeting */}
        {headToHead.last_meeting_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Meeting</span>
            <span className="text-sm">
              {new Date(headToHead.last_meeting_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
              {headToHead.last_meeting_winner_team_id && (
                <span className="ml-1 text-muted-foreground">
                  ({headToHead.last_meeting_winner_team_id} won)
                </span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
