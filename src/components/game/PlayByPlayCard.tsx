'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { PlayByPlay, Team } from '@/types/game'

interface PlayByPlayCardProps {
  plays: PlayByPlay[]
  homeTeam: Team
  awayTeam: Team
}

interface Drive {
  driveNumber: number
  teamId: string | null
  plays: PlayByPlay[]
  result: string
  totalYards: number
  playCount: number
  startQuarter: number
  endQuarter: number
  startTime: string
  endTime: string
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatQuarter(quarter: number): string {
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

function formatDown(down: number | null, yardsToGo: number | null): string {
  if (!down) return ''
  const suffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th'
  return `${down}${suffix}${yardsToGo ? ` & ${yardsToGo}` : ''}`
}

function formatYardLine(yardLine: number | null, possTeam: string | null): string {
  if (yardLine === null) return ''
  if (yardLine === 50) return '50'
  if (yardLine < 0) return `Own ${Math.abs(yardLine)}`
  if (yardLine > 50) return `Opp ${100 - yardLine}`
  return `${yardLine}`
}

function getDriveResult(plays: PlayByPlay[]): string {
  if (!plays.length) return 'Unknown'

  // Filter out marker plays (END QUARTER, GAME, etc.) to find actual last play
  const actualPlays = plays.filter(p =>
    p.play_type &&
    !p.play_description.toLowerCase().includes('end quarter') &&
    !p.play_description.toLowerCase().includes('end of') &&
    p.play_description !== 'GAME'
  )

  const lastPlay = actualPlays[actualPlays.length - 1] || plays[plays.length - 1]
  if (!lastPlay) return 'Unknown'

  const desc = lastPlay.play_description.toLowerCase()
  const playType = lastPlay.play_type?.toLowerCase() || ''

  // Check for touchdown in any play of the drive
  if (plays.some(p => p.play_description.toLowerCase().includes('touchdown'))) {
    return 'Touchdown'
  }

  // Check last actual play by play_type first (most reliable)
  if (playType === 'punt') {
    return 'Punt'
  }
  if (playType === 'field_goal') {
    if (desc.includes('no good') || desc.includes('missed') || desc.includes('blocked')) {
      return 'Missed FG'
    }
    return 'Field Goal'
  }

  // Check description for turnovers
  if (desc.includes('intercepted') || desc.includes('interception')) {
    return 'Interception'
  }
  if (desc.includes('fumble') && (desc.includes('recovered by') || desc.includes('forced by'))) {
    // Check if fumble was recovered by same team (not a turnover)
    if (!desc.includes('recovered by ' + lastPlay.possession_team_id?.toLowerCase())) {
      return 'Fumble'
    }
  }

  // Check for turnover on downs (4th down failure)
  if (lastPlay.down === 4 && (playType === 'pass' || playType === 'run')) {
    const neededYards = lastPlay.yards_to_go || 0
    const gainedYards = lastPlay.yards_gained || 0
    if (gainedYards < neededYards) {
      return 'Turnover on Downs'
    }
  }

  // Quarter/half/game endings
  if (desc.includes('end quarter') || desc.includes('end of quarter')) {
    return 'End of Quarter'
  }
  if (desc.includes('end of half') || desc.includes('two-minute warning')) {
    return 'End of Half'
  }
  if (desc.includes('end of game')) {
    return 'End of Game'
  }

  // Kickoff (usually start of possession after score)
  if (playType === 'kickoff') {
    return 'Kickoff'
  }

  // Kneel downs at end of game/half
  if (playType === 'qb_kneel') {
    return 'Kneel'
  }

  return 'In Progress'
}

function getDriveResultColor(result: string): string {
  switch (result) {
    case 'Touchdown':
      return 'bg-green-600'
    case 'Field Goal':
      return 'bg-green-500'
    case 'Punt':
    case 'End of Quarter':
    case 'End of Half':
    case 'End of Game':
      return 'bg-gray-500'
    case 'Interception':
    case 'Fumble':
    case 'Turnover on Downs':
      return 'bg-red-500'
    case 'Missed FG':
      return 'bg-orange-500'
    case 'Kickoff':
      return 'bg-blue-500'
    default:
      return 'bg-blue-500'
  }
}

function groupPlaysByDrive(plays: PlayByPlay[]): Drive[] {
  if (plays.length === 0) return []

  // Sort plays by quarter and time
  const sortedPlays = [...plays].sort((a, b) => {
    if (a.quarter !== b.quarter) return a.quarter - b.quarter
    return (b.time_remaining_seconds || 0) - (a.time_remaining_seconds || 0)
  })

  const drives: Drive[] = []
  let currentDrive: PlayByPlay[] = []
  let currentTeam: string | null = null
  let driveNumber = 0

  sortedPlays.forEach((play, index) => {
    const playType = play.play_type?.toLowerCase() || ''
    const isKickoff = playType === 'kickoff'
    const isPunt = playType === 'punt'
    const isExtraPoint = playType === 'extra_point' || playType === 'two_point_attempt'
    const isEndQuarter = play.play_description.toLowerCase().includes('end quarter')
    const isGameMarker = play.play_description === 'GAME'

    // Skip game start markers
    if (isGameMarker) return

    // New drive on kickoff (not the first play after TD)
    if (isKickoff && currentDrive.length > 0) {
      // Save current drive
      drives.push(createDrive(currentDrive, driveNumber, currentTeam))
      driveNumber++
      currentDrive = [play]
      currentTeam = play.possession_team_id
      return
    }

    // Possession change (not on special teams plays)
    if (play.possession_team_id &&
        play.possession_team_id !== currentTeam &&
        !isKickoff && !isPunt && !isExtraPoint &&
        currentDrive.length > 0) {
      // Save current drive
      drives.push(createDrive(currentDrive, driveNumber, currentTeam))
      driveNumber++
      currentDrive = []
      currentTeam = play.possession_team_id
    }

    // Set initial team
    if (!currentTeam && play.possession_team_id) {
      currentTeam = play.possession_team_id
    }

    currentDrive.push(play)
  })

  // Save final drive
  if (currentDrive.length > 0) {
    drives.push(createDrive(currentDrive, driveNumber, currentTeam))
  }

  return drives
}

function createDrive(plays: PlayByPlay[], driveNumber: number, teamId: string | null): Drive {
  const firstPlay = plays[0]
  const lastPlay = plays[plays.length - 1]

  // Filter out non-yardage plays for total calculation
  const scrimmage = plays.filter(p =>
    p.play_type && !['kickoff', 'extra_point', 'two_point_attempt', 'punt'].includes(p.play_type.toLowerCase())
  )
  const totalYards = scrimmage.reduce((sum, p) => sum + (p.yards_gained || 0), 0)

  return {
    driveNumber,
    teamId,
    plays,
    result: getDriveResult(plays),
    totalYards,
    playCount: scrimmage.length,
    startQuarter: firstPlay?.quarter || 1,
    endQuarter: lastPlay?.quarter || 1,
    startTime: formatTime(firstPlay?.time_remaining_seconds),
    endTime: formatTime(lastPlay?.time_remaining_seconds)
  }
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
            <span className="text-sm font-medium">
              {team?.team_abbr || 'Unknown'} Drive
            </span>
            <Badge className={`text-xs ${getDriveResultColor(drive.result)}`}>
              {drive.result}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatQuarter(drive.startQuarter)} {drive.startTime} → {drive.endTime}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
          <span>{drive.playCount} plays</span>
          <span className={drive.totalYards > 0 ? 'text-green-600' : drive.totalYards < 0 ? 'text-red-500' : ''}>
            {drive.totalYards > 0 ? '+' : ''}{drive.totalYards} yds
          </span>
        </div>
      </button>

      {/* Expanded Play-by-Play */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-3 space-y-2">
          {drive.plays.map((play) => {
            const isTouchdown = play.play_description.toLowerCase().includes('touchdown')
            const isTurnover = play.play_description.toLowerCase().includes('intercept') ||
                              (play.play_description.toLowerCase().includes('fumble') &&
                               play.play_description.toLowerCase().includes('recovered'))

            return (
              <div
                key={play.play_id}
                className={`p-2 rounded text-sm ${
                  isTouchdown
                    ? 'bg-green-500/10 border border-green-500/30'
                    : isTurnover
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-background'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-medium">
                    {formatQuarter(play.quarter)} {formatTime(play.time_remaining_seconds)}
                  </span>
                  {play.down && (
                    <Badge variant="outline" className="text-xs py-0">
                      {formatDown(play.down, play.yards_to_go)}
                    </Badge>
                  )}
                  {play.yard_line !== null && (
                    <span>
                      @ {formatYardLine(play.yard_line, play.possession_team_id)}
                    </span>
                  )}
                  {play.yards_gained !== 0 && (
                    <Badge
                      variant={play.yards_gained > 10 ? 'default' : 'outline'}
                      className="text-xs py-0 ml-auto"
                    >
                      {play.yards_gained > 0 ? '+' : ''}{play.yards_gained} yds
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{play.play_description}</p>
                {play.epa !== null && play.epa !== 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className={play.epa > 0 ? 'text-green-600' : 'text-red-500'}>
                      EPA: {play.epa > 0 ? '+' : ''}{play.epa.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PlayByPlayCard({ plays, homeTeam, awayTeam }: PlayByPlayCardProps) {
  const [expandedDrives, setExpandedDrives] = useState<Set<number>>(new Set())

  const teams: Record<string, Team> = useMemo(() => ({
    [homeTeam.team_id]: homeTeam,
    [awayTeam.team_id]: awayTeam
  }), [homeTeam, awayTeam])

  const drives = useMemo(() => groupPlaysByDrive(plays), [plays])

  if (plays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Play-by-Play</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No play-by-play data available</p>
        </CardContent>
      </Card>
    )
  }

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
          <CardTitle className="text-lg">Play-by-Play</CardTitle>
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
