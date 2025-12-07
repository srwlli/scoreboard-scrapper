'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GameRosterCardProps, GameRoster } from '@/types/game'

// Position sort order for display
const POSITION_ORDER: Record<string, number> = {
  'QB': 1,
  'RB': 2, 'FB': 2,
  'WR': 3,
  'TE': 4,
  'OT': 5, 'OG': 5, 'C': 5, 'OL': 5, 'T': 5, 'G': 5,
  'DE': 6, 'DT': 6, 'NT': 6, 'DL': 6,
  'LB': 7, 'OLB': 7, 'ILB': 7, 'MLB': 7,
  'CB': 8, 'S': 8, 'FS': 8, 'SS': 8, 'DB': 8,
  'K': 9, 'P': 10, 'LS': 11
}

function getPositionOrder(position: string | null): number {
  if (!position) return 99
  return POSITION_ORDER[position.toUpperCase()] || 50
}

function sortByPosition(a: GameRoster, b: GameRoster): number {
  const orderA = getPositionOrder(a.position || a.player?.primary_position)
  const orderB = getPositionOrder(b.position || b.player?.primary_position)
  if (orderA !== orderB) return orderA - orderB
  // Secondary sort by jersey number
  const jerseyA = a.jersey_number ?? a.player?.jersey_number ?? 99
  const jerseyB = b.jersey_number ?? b.player?.jersey_number ?? 99
  return jerseyA - jerseyB
}

export function GameRosterCard({
  rosters,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam,
}: GameRosterCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(awayTeamId)

  if (!rosters || rosters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No roster data available</p>
        </CardContent>
      </Card>
    )
  }

  // Filter by selected team
  const teamRosters = rosters.filter(r => r.team_id === selectedTeam)

  // Separate active and inactive
  const activePlayers = teamRosters.filter(r => r.active).sort(sortByPosition)
  const inactivePlayers = teamRosters.filter(r => !r.active).sort(sortByPosition)

  const selectedTeamData = selectedTeam === homeTeamId ? homeTeam : awayTeam

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Game Roster</CardTitle>
          <ToggleGroup
            type="single"
            value={selectedTeam}
            onValueChange={(v) => v && setSelectedTeam(v)}
          >
            <ToggleGroupItem value={awayTeamId} className="text-xs px-3">
              {awayTeam.team_abbr}
            </ToggleGroupItem>
            <ToggleGroupItem value={homeTeamId} className="text-xs px-3">
              {homeTeam.team_abbr}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>{selectedTeamData.team_name}</span>
          <span>•</span>
          <Badge variant="secondary" className="text-xs">
            {activePlayers.length} Active
          </Badge>
          {inactivePlayers.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {inactivePlayers.length} Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Players */}
        {activePlayers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Active ({activePlayers.length})
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="w-16 text-right">Pos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePlayers.map((roster) => (
                    <TableRow key={roster.game_roster_id}>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {roster.jersey_number ?? roster.player?.jersey_number ?? '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {roster.player?.full_name ?? `Player ${roster.player_id}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {roster.position || roster.player?.primary_position || '-'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Inactive Players */}
        {inactivePlayers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Inactive ({inactivePlayers.length})
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="w-16 text-right">Pos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactivePlayers.map((roster) => (
                    <TableRow key={roster.game_roster_id} className="text-muted-foreground">
                      <TableCell className="tabular-nums">
                        {roster.jersey_number ?? roster.player?.jersey_number ?? '-'}
                      </TableCell>
                      <TableCell>
                        {roster.player?.full_name ?? `Player ${roster.player_id}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {roster.position || roster.player?.primary_position || '-'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
