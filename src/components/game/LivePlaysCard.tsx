import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { abbreviateNamesInDescription } from '@/lib/utils'
import type { LivePlay, Team } from '@/types/game'

interface LivePlaysCardProps {
  plays: LivePlay[]
  teams: Record<string, Team>
  homeTeam: Team
  awayTeam: Team
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

// Helper to detect special play types
function getPlayTypeBadge(playType: string | null, playText: string | null, isScoring: boolean): {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string
} | null {
  const type = playType?.toLowerCase() || ''
  const text = playText?.toLowerCase() || ''

  // Kickoff plays
  if (type.includes('kickoff')) {
    // Check for touchback
    if (text.includes('touchback')) {
      return { label: 'TB', variant: 'secondary', className: 'bg-blue-600 text-white' }
    }
    return { label: 'KO', variant: 'secondary', className: 'bg-orange-500 text-white' }
  }

  // Extra point detection (in play text, usually part of TD play)
  if (text.includes('extra point')) {
    if (text.includes('is good') || text.includes('kick good')) {
      return { label: 'XP', variant: 'default', className: 'bg-green-600' }
    }
    if (text.includes('no good') || text.includes('blocked') || text.includes('failed')) {
      return { label: 'XP ❌', variant: 'destructive' }
    }
    return { label: 'XP', variant: 'outline' }
  }

  // Two-point conversion
  if (text.includes('two-point') || text.includes('2-point') || type.includes('two point')) {
    if (text.includes('succeed') || text.includes('good') || text.includes('complete')) {
      return { label: '2PT', variant: 'default', className: 'bg-green-600' }
    }
    if (text.includes('fail') || text.includes('no good') || text.includes('incomplete')) {
      return { label: '2PT ❌', variant: 'destructive' }
    }
    return { label: '2PT', variant: 'outline' }
  }

  // Field goal
  if (type.includes('field goal')) {
    if (type.includes('good') || text.includes('is good')) {
      return { label: 'FG', variant: 'default', className: 'bg-green-600' }
    }
    if (type.includes('missed') || type.includes('blocked') || text.includes('no good')) {
      return { label: 'FG ❌', variant: 'destructive' }
    }
    return { label: 'FG', variant: 'outline' }
  }

  // Punt
  if (type.includes('punt')) {
    if (text.includes('touchback')) {
      return { label: 'PUNT TB', variant: 'secondary' }
    }
    if (text.includes('block')) {
      return { label: 'PUNT BLK', variant: 'destructive' }
    }
    return { label: 'PUNT', variant: 'secondary' }
  }

  // Touchdown types (only if scoring)
  if (isScoring) {
    if (type.includes('passing') || type.includes('pass')) {
      return { label: 'PASS TD', variant: 'default', className: 'bg-green-600' }
    }
    if (type.includes('rushing') || type.includes('rush')) {
      return { label: 'RUSH TD', variant: 'default', className: 'bg-green-600' }
    }
    if (type.includes('interception') && text.includes('return')) {
      return { label: 'INT TD', variant: 'default', className: 'bg-green-600' }
    }
    if (type.includes('fumble') && text.includes('return')) {
      return { label: 'FUM TD', variant: 'default', className: 'bg-green-600' }
    }
    if (type.includes('kick') || type.includes('return')) {
      return { label: 'RET TD', variant: 'default', className: 'bg-green-600' }
    }
    // Default TD badge
    return { label: 'TD', variant: 'default', className: 'bg-green-600' }
  }

  // Sack
  if (type.includes('sack') || (text.includes('sack') && !text.includes('quarterback'))) {
    return { label: 'SACK', variant: 'destructive' }
  }

  // Interception
  if (type.includes('interception') || text.match(/intercept(ed|ion)/)) {
    return { label: 'INT', variant: 'destructive' }
  }

  // Safety
  if (type.includes('safety') || text.includes('safety')) {
    return { label: 'SAFETY', variant: 'destructive' }
  }

  return null
}

export function LivePlaysCard({ plays, teams, homeTeam, awayTeam }: LivePlaysCardProps) {
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
              const playBadge = getPlayTypeBadge(play.play_type, play.play_text, isScoring)

              // Determine background color based on play type
              const isKickoff = play.play_type?.toLowerCase().includes('kickoff')
              const isPunt = play.play_type?.toLowerCase().includes('punt')
              const isFieldGoal = play.play_type?.toLowerCase().includes('field goal')
              const isSpecialTeams = isKickoff || isPunt || isFieldGoal
              const hasXP = play.play_text?.toLowerCase().includes('extra point')

              return (
                <div
                  key={play.play_id}
                  className={`p-3 rounded-lg border ${
                    isScoring
                      ? 'bg-green-500/10 border-green-500/30'
                      : isTurnover
                      ? 'bg-red-500/10 border-red-500/30'
                      : isKickoff
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : isPunt
                      ? 'bg-purple-500/10 border-purple-500/30'
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
                      {/* Only show down/distance for regular plays, not kickoffs/punts/XPs */}
                      {play.down && !isKickoff && !hasXP && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDown(play.down, play.yards_to_go)}
                        </Badge>
                      )}
                      {play.yard_line && !isKickoff && !hasXP && (
                        <span className="text-xs text-muted-foreground">
                          at {formatYardLine(play.yard_line, play.yard_line_side)}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {/* Play type badge from helper function */}
                      {playBadge && (
                        <Badge
                          variant={playBadge.variant}
                          className={`text-xs ${playBadge.className || ''}`}
                        >
                          {playBadge.label}
                        </Badge>
                      )}
                      {/* Turnover badge (only if no play badge already showing it) */}
                      {isTurnover && !playBadge?.label.includes('INT') && !playBadge?.label.includes('FUM') && (
                        <Badge variant="destructive" className="text-xs">
                          TO
                        </Badge>
                      )}
                      {/* Yards gained (hide for kickoffs/punts/XPs where it's not meaningful) */}
                      {play.yards_gained !== null && play.yards_gained !== 0 && !isKickoff && !hasXP && !isPunt && (
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
                    <p className="text-sm line-clamp-2">{abbreviateNamesInDescription(play.play_text)}</p>
                  )}

                  {/* Score after play */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {awayTeam.team_abbr} {play.away_score}
                      </span>
                      <span>-</span>
                      <span className="font-medium text-foreground">
                        {homeTeam.team_abbr} {play.home_score}
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
