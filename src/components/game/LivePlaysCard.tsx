import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { LivePlay, Team } from '@/types/game'

interface LivePlaysCardProps {
  plays: LivePlay[]
  teams: Record<string, Team>
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatDown(down: number | null, yardsToGo: number | null): string {
  if (!down) return ''
  const suffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th'
  return `${down}${suffix}${yardsToGo ? ` & ${yardsToGo}` : ''}`
}

function formatQuarter(quarter: number | null): string {
  if (!quarter) return ''
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

function formatYardLine(yardLine: number | null, yardLineSide: string | null): string {
  if (!yardLine) return ''
  if (yardLineSide) {
    return `${yardLineSide} ${yardLine}`
  }
  return yardLine <= 50 ? `Own ${yardLine}` : `Opp ${100 - yardLine}`
}

export function LivePlaysCard({ plays, teams }: LivePlaysCardProps) {
  if (plays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Play Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No play-by-play data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Play Feed</CardTitle>
          <Badge variant="outline" className="text-xs">
            {plays.length} plays
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[400px] overflow-y-auto pr-2">
          <div className="space-y-2">
            {plays.map((play, index) => {
              const team = play.possession_team_id ? teams[play.possession_team_id] : null
              const isScoring = play.is_scoring_play
              const isTurnover = play.is_turnover

              return (
                <div
                  key={play.play_id}
                  className={`p-3 rounded-lg border ${
                    isScoring
                      ? 'bg-green-500/10 border-green-500/30'
                      : isTurnover
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-muted/50 border-transparent'
                  }`}
                >
                  {/* Play header */}
                  <div className="flex items-center gap-2 mb-2">
                    {team && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={getTeamLogoUrl(team.team_id)}
                          alt={team.team_name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {team.team_abbr}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {formatQuarter(play.quarter)} {play.game_clock}
                      </span>
                      {play.down && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDown(play.down, play.yards_to_go)}
                        </Badge>
                      )}
                      {play.yard_line && (
                        <span className="text-xs text-muted-foreground">
                          at {formatYardLine(play.yard_line, play.yard_line_side)}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {isScoring && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          TD
                        </Badge>
                      )}
                      {isTurnover && (
                        <Badge variant="destructive" className="text-xs">
                          TO
                        </Badge>
                      )}
                      {play.yards_gained !== null && play.yards_gained !== 0 && (
                        <Badge
                          variant={play.yards_gained > 10 ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {play.yards_gained > 0 ? '+' : ''}
                          {play.yards_gained} yds
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Play text */}
                  {play.play_text && (
                    <p className="text-sm line-clamp-2">{play.play_text}</p>
                  )}

                  {/* Score after play */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Score:</span>
                      <span className="font-medium text-foreground">
                        {play.away_score} - {play.home_score}
                      </span>
                    </div>
                    {play.epa !== null && (
                      <span className={play.epa > 0 ? 'text-green-600' : play.epa < 0 ? 'text-red-500' : ''}>
                        EPA: {play.epa > 0 ? '+' : ''}{play.epa.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
