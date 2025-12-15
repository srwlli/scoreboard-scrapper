'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { abbreviateNamesInDescription } from '@/lib/utils'
import type { LivePlay, LiveDrive, Team } from '@/types/game'

interface DrivesSummaryCardProps {
  plays: LivePlay[]
  teams: Record<string, Team>
  liveDrives?: LiveDrive[]  // Scraped drive results from ESPN (preferred)
}

interface Drive {
  driveNumber: number
  teamId: string | null
  plays: LivePlay[]
  result: string
  totalYards: number
  playCount: number
  startYardLine: string
  endYardLine: string
  startQuarter: number | null
  endQuarter: number | null
  // Enhanced fields (WO-HISTORICAL-BACKFILL-001)
  firstDowns: number | null
  penaltyCount: number | null
  yardsPenalized: number | null
  isRedZone: boolean | null
  timeElapsed: string | null
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatQuarter(quarter: number | null): string {
  if (!quarter) return ''
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

function formatDown(down: number | null, yardsToGo: number | null): string {
  if (!down) return ''
  const suffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th'
  return `${down}${suffix}${yardsToGo ? ` & ${yardsToGo}` : ''}`
}

function getDriveResult(plays: LivePlay[]): string {
  // Check last play for drive result
  const lastPlay = plays[plays.length - 1]
  if (!lastPlay) return 'Unknown'

  // Check for scoring
  const scoringPlay = plays.find(p => p.is_scoring_play)
  if (scoringPlay) {
    const playType = scoringPlay.play_type?.toLowerCase() || ''
    const playText = scoringPlay.play_text?.toLowerCase() || ''
    if (playType.includes('field_goal') || playText.includes('field goal')) {
      if (playText.includes('no good') || playText.includes('missed') || playText.includes('blocked')) {
        return 'Missed FG'
      }
      return 'Field Goal'
    }
    if (playText.includes('safety')) return 'Safety'
    return 'Touchdown'
  }

  // Check for turnover
  if (plays.some(p => p.is_turnover)) {
    const turnoverPlay = plays.find(p => p.is_turnover)
    const playText = turnoverPlay?.play_text?.toLowerCase() || ''
    if (playText.includes('intercept')) return 'Interception'
    if (playText.includes('fumble')) return 'Fumble'
    return 'Turnover'
  }

  // Check last play type
  const lastPlayType = lastPlay.play_type?.toLowerCase() || ''
  const lastPlayText = lastPlay.play_text?.toLowerCase() || ''

  if (lastPlayType.includes('punt') || lastPlayText.includes('punts')) return 'Punt'
  if (lastPlayType.includes('field_goal') || lastPlayText.includes('field goal')) {
    if (lastPlayText.includes('no good') || lastPlayText.includes('missed') || lastPlayText.includes('blocked')) return 'Missed FG'
    return 'Field Goal'
  }
  if (lastPlayText.includes('touchdown')) return 'Touchdown'
  if (lastPlayText.includes('safety')) return 'Safety'

  // Check for kneel downs
  if (lastPlayType.includes('kneel') || lastPlayText.includes('kneels') || lastPlayText.includes('kneel')) return 'Kneel'

  // Check for turnover on downs
  if (lastPlayText.includes('turnover on downs') || lastPlayText.includes('downs')) return 'Turnover on Downs'

  // Check for end of quarter/half/game
  if (lastPlayText.includes('end of game') || lastPlayText.includes('game over')) return 'End of Game'
  if (lastPlayText.includes('end of half') || lastPlayText.includes('halftime')) return 'End of Half'
  if (lastPlayText.includes('end of quarter') || lastPlayText.includes('end quarter')) return 'End of Quarter'

  // Check the game clock - if 0:00 in Q2 or Q4
  if (lastPlay.game_clock === '0:00') {
    if (lastPlay.quarter === 2) return 'End of Half'
    if (lastPlay.quarter === 4 || lastPlay.quarter === 5) return 'End of Game'
    return 'End of Quarter'
  }

  // Default for completed drives we couldn't categorize
  return 'Drive Complete'
}

function getDriveResultColor(result: string): string {
  switch (result) {
    case 'Touchdown':
      return 'bg-green-600'
    case 'Field Goal':
      return 'bg-green-500'
    case 'Safety':
      return 'bg-yellow-600'
    case 'Punt':
    case 'Kneel':
    case 'End of Quarter':
    case 'End of Half':
    case 'End of Game':
    case 'Drive Complete':
      return 'bg-gray-500'
    case 'Interception':
    case 'Fumble':
    case 'Turnover':
    case 'Turnover on Downs':
      return 'bg-red-500'
    case 'Missed FG':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

function groupPlaysByDrive(plays: LivePlay[], liveDrives?: LiveDrive[]): Drive[] {
  const driveMap = new Map<number, LivePlay[]>()

  // Group plays by drive number
  plays.forEach(play => {
    const driveNum = play.drive_number || 0
    if (!driveMap.has(driveNum)) {
      driveMap.set(driveNum, [])
    }
    driveMap.get(driveNum)!.push(play)
  })

  // Create a lookup map for scraped drive results (if available)
  const driveResultsMap = new Map<number, LiveDrive>()
  if (liveDrives) {
    liveDrives.forEach(drive => {
      driveResultsMap.set(drive.drive_number, drive)
    })
  }

  // Convert to Drive objects, sorted by play_number within each drive
  const drives: Drive[] = []
  driveMap.forEach((drivePlays, driveNumber) => {
    // Sort plays within drive by play_number ascending
    const sortedPlays = [...drivePlays].sort((a, b) => (a.play_number || 0) - (b.play_number || 0))

    const firstPlay = sortedPlays[0]
    const lastPlay = sortedPlays[sortedPlays.length - 1]

    // Get scraped drive data if available
    const scrapedDrive = driveResultsMap.get(driveNumber)

    // Use scraped yards/play_count if available, otherwise calculate
    const totalYards = scrapedDrive?.yards ?? sortedPlays.reduce((sum, p) => sum + (p.yards_gained || 0), 0)
    const playCount = scrapedDrive?.play_count ?? sortedPlays.length

    // Use scraped drive result from ESPN if available, otherwise compute
    const result = scrapedDrive?.display_result || getDriveResult(sortedPlays)

    drives.push({
      driveNumber,
      teamId: scrapedDrive?.team_id || firstPlay?.possession_team_id || null,
      plays: sortedPlays,
      result,
      totalYards,
      playCount,
      startYardLine: scrapedDrive?.start_yard_line_text || (firstPlay?.yard_line_side
        ? `${firstPlay.yard_line_side} ${firstPlay.yard_line}`
        : `${firstPlay?.yard_line || ''}`),
      endYardLine: scrapedDrive?.end_yard_line_text || (lastPlay?.yard_line_side
        ? `${lastPlay.yard_line_side} ${lastPlay.yard_line}`
        : `${lastPlay?.yard_line || ''}`),
      startQuarter: scrapedDrive?.start_quarter || firstPlay?.quarter || null,
      endQuarter: scrapedDrive?.end_quarter || lastPlay?.quarter || null,
      // Enhanced fields (WO-HISTORICAL-BACKFILL-001)
      firstDowns: scrapedDrive?.first_downs ?? null,
      penaltyCount: scrapedDrive?.penalty_count ?? null,
      yardsPenalized: scrapedDrive?.yards_penalized ?? null,
      isRedZone: scrapedDrive?.is_red_zone ?? null,
      timeElapsed: scrapedDrive?.time_elapsed ?? null
    })
  })

  // Sort drives by drive number descending (most recent first)
  return drives.sort((a, b) => b.driveNumber - a.driveNumber)
}

function DriveRow({ drive, teams, isExpanded, onToggle }: {
  drive: Drive
  teams: Record<string, Team>
  isExpanded: boolean
  onToggle: () => void
}) {
  const team = drive.teamId ? teams[drive.teamId] : null

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Drive Summary Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        {team && (
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={getTeamLogoUrl(team.team_id)} alt={team.team_name} />
            <AvatarFallback className="text-[10px]">{team.team_abbr}</AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Drive {drive.driveNumber}</span>
            <Badge className={`text-xs ${getDriveResultColor(drive.result)}`}>
              {drive.result}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {drive.startYardLine} → {drive.endYardLine}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
          <span>{drive.playCount} plays</span>
          <span className={drive.totalYards > 0 ? 'text-green-600' : drive.totalYards < 0 ? 'text-red-500' : ''}>
            {drive.totalYards > 0 ? '+' : ''}{drive.totalYards} yds
          </span>
          {/* Enhanced fields (WO-HISTORICAL-BACKFILL-001) */}
          {drive.firstDowns != null && drive.firstDowns > 0 && (
            <span className="text-blue-500">{drive.firstDowns} 1st</span>
          )}
          {drive.timeElapsed && (
            <span>{drive.timeElapsed}</span>
          )}
          {drive.isRedZone && (
            <Badge variant="outline" className="text-xs py-0 border-red-500 text-red-500">
              RZ
            </Badge>
          )}
          {drive.startQuarter && (
            <span>{formatQuarter(drive.startQuarter)}</span>
          )}
        </div>
      </button>

      {/* Expanded Play-by-Play */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-3 space-y-2">
          {/* Drive stats summary (WO-HISTORICAL-BACKFILL-001) */}
          {(drive.penaltyCount != null && drive.penaltyCount > 0) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 mb-2 border-b">
              <span className="text-yellow-600">
                {drive.penaltyCount} {drive.penaltyCount === 1 ? 'penalty' : 'penalties'}
                {drive.yardsPenalized ? ` (-${drive.yardsPenalized} yds)` : ''}
              </span>
            </div>
          )}
          {drive.plays.map((play, index) => (
            <div
              key={play.play_id}
              className={`p-2 rounded text-sm ${
                play.is_scoring_play
                  ? 'bg-green-500/10 border border-green-500/30'
                  : play.is_turnover
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-background'
              }`}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="font-medium">
                  {formatQuarter(play.quarter)} {play.game_clock}
                </span>
                {play.down && (
                  <Badge variant="outline" className="text-xs py-0">
                    {formatDown(play.down, play.yards_to_go)}
                  </Badge>
                )}
                {play.yard_line && (
                  <span>
                    at {play.yard_line_side ? `${play.yard_line_side} ${play.yard_line}` : play.yard_line}
                  </span>
                )}
                {play.yards_gained !== null && play.yards_gained !== 0 && (
                  <Badge
                    variant={play.yards_gained > 10 ? 'default' : 'outline'}
                    className="text-xs py-0 ml-auto"
                  >
                    {play.yards_gained > 0 ? '+' : ''}{play.yards_gained} yds
                  </Badge>
                )}
              </div>
              {play.play_text && (
                <p className="text-sm">{abbreviateNamesInDescription(play.play_text)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DrivesSummaryCard({ plays, teams, liveDrives }: DrivesSummaryCardProps) {
  const [expandedDrives, setExpandedDrives] = useState<Set<number>>(new Set())

  if (plays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No play-by-play data available</p>
        </CardContent>
      </Card>
    )
  }

  // Use scraped drive results from ESPN when available
  const drives = groupPlaysByDrive(plays, liveDrives)

  const toggleDrive = (driveNumber: number) => {
    setExpandedDrives(prev => {
      const next = new Set(prev)
      if (next.has(driveNumber)) {
        next.delete(driveNumber)
      } else {
        next.add(driveNumber)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedDrives(new Set(drives.map(d => d.driveNumber)))
  }

  const collapseAll = () => {
    setExpandedDrives(new Set())
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Drive Summary</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {drives.length} drives • {plays.length} plays
            </Badge>
            <button
              onClick={expandedDrives.size > 0 ? collapseAll : expandAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {expandedDrives.size > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[500px] overflow-y-auto pr-2 space-y-2">
          {drives.map(drive => (
            <DriveRow
              key={drive.driveNumber}
              drive={drive}
              teams={teams}
              isExpanded={expandedDrives.has(drive.driveNumber)}
              onToggle={() => toggleDrive(drive.driveNumber)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
