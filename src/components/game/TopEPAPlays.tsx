import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { PlayByPlay, Team } from '@/types/game'

interface TopEPAPlaysProps {
  plays: PlayByPlay[]
  teams: Record<string, Team>
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatQuarter(quarter: number): string {
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

export function TopEPAPlays({ plays, teams }: TopEPAPlaysProps) {
  // Sort by EPA descending and take top 10
  const topPlays = [...plays]
    .filter(p => p.epa !== null)
    .sort((a, b) => (b.epa ?? 0) - (a.epa ?? 0))
    .slice(0, 10)

  if (topPlays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top EPA Plays</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No play-by-play data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top EPA Plays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPlays.map((play, index) => {
          const team = teams[play.possession_team_id]
          const epa = play.epa ?? 0

          return (
            <div
              key={play.play_id}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                  src={team ? getTeamLogoUrl(team.team_id) : ''}
                  alt={team?.team_name || play.possession_team_id}
                />
                <AvatarFallback>{play.possession_team_id}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={epa > 3 ? 'default' : 'secondary'} className="text-xs">
                    +{epa.toFixed(1)} EPA
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatQuarter(play.quarter)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {play.yards_gained > 0 ? '+' : ''}{play.yards_gained} yds
                  </Badge>
                </div>
                <p className="text-sm line-clamp-2">
                  {play.play_description}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
