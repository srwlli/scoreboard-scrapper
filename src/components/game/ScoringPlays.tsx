import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ScoringPlay, Team } from '@/types/game'
import { formatTime } from '@/types/game'

interface ScoringPlaysProps {
  plays: ScoringPlay[]
  teams: Record<string, Team>
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function getQuarterLabel(quarter: number): string {
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

function getPlayTypeBadge(playType: string): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (playType.toLowerCase()) {
    case 'touchdown':
      return { label: 'TD', variant: 'default' }
    case 'field_goal':
      return { label: 'FG', variant: 'secondary' }
    case 'safety':
      return { label: 'SAF', variant: 'destructive' }
    case 'two_point':
      return { label: '2PT', variant: 'outline' }
    default:
      return { label: playType.toUpperCase(), variant: 'outline' }
  }
}

export function ScoringPlays({ plays, teams }: ScoringPlaysProps) {
  if (plays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scoring Plays</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scoring plays recorded</p>
        </CardContent>
      </Card>
    )
  }

  // Group plays by quarter
  const playsByQuarter = plays.reduce((acc, play) => {
    const q = play.quarter
    if (!acc[q]) acc[q] = []
    acc[q].push(play)
    return acc
  }, {} as Record<number, ScoringPlay[]>)

  const quarters = Object.keys(playsByQuarter).map(Number).sort((a, b) => a - b)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scoring Plays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {quarters.map((quarter) => (
          <div key={quarter}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {getQuarterLabel(quarter)}
            </h4>
            <div className="space-y-3">
              {playsByQuarter[quarter].map((play) => {
                const team = teams[play.team_id]
                const badgeInfo = getPlayTypeBadge(play.scoring_type)

                return (
                  <div
                    key={play.scoring_play_id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={team ? getTeamLogoUrl(team.team_id) : ''}
                        alt={team?.team_name || play.team_id}
                      />
                      <AvatarFallback>{play.team_id}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={badgeInfo.variant} className="text-xs">
                          {badgeInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(play.time_remaining_seconds)}
                        </span>
                        <span className="text-xs font-medium">
                          +{play.points}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">
                        {play.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
