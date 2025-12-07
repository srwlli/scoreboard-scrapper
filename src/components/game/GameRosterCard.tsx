'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import type { GameRosterCardProps, GameRoster } from '@/types/game'

// Position groups for depth chart display
const POSITION_GROUPS = [
  { label: 'Offense', positions: ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C', 'OL', 'T', 'G'] },
  { label: 'Defense', positions: ['DE', 'DT', 'NT', 'DL', 'LB', 'OLB', 'ILB', 'MLB', 'CB', 'S', 'FS', 'SS', 'DB'] },
  { label: 'Special Teams', positions: ['K', 'P', 'LS'] },
]

// Canonical position order within each group
const POSITION_ORDER: Record<string, number> = {
  'QB': 1,
  'RB': 2, 'FB': 3,
  'WR': 4,
  'TE': 5,
  'OT': 6, 'T': 6, 'OG': 7, 'G': 7, 'C': 8, 'OL': 9,
  'DE': 10, 'DT': 11, 'NT': 12, 'DL': 13,
  'LB': 14, 'OLB': 15, 'ILB': 16, 'MLB': 17,
  'CB': 18, 'S': 19, 'FS': 20, 'SS': 21, 'DB': 22,
  'K': 23, 'P': 24, 'LS': 25
}

// Normalize position to canonical form
function normalizePosition(pos: string | null): string {
  if (!pos) return 'UNKNOWN'
  const upper = pos.toUpperCase()
  // Map common variations
  if (upper === 'T') return 'OT'
  if (upper === 'G') return 'OG'
  return upper
}

function getPositionOrder(position: string | null): number {
  if (!position) return 99
  return POSITION_ORDER[position.toUpperCase()] || 50
}

function getPositionGroup(position: string | null): string {
  if (!position) return 'Other'
  const upper = position.toUpperCase()
  for (const group of POSITION_GROUPS) {
    if (group.positions.includes(upper)) {
      return group.label
    }
  }
  return 'Other'
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
          <CardTitle className="text-lg">Game Day Depth Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No roster data available</p>
        </CardContent>
      </Card>
    )
  }

  // Filter by selected team
  const teamRosters = rosters.filter(r => r.team_id === selectedTeam)

  // Separate into 3 categories:
  // 1. Played (played=true) - actually got on field
  // 2. DNP (played=false, active=true) - dressed but did not play
  // 3. Inactive (active=false) - declared inactive before game
  const playedPlayers = teamRosters.filter(r => r.played === true)
  const dnpPlayers = teamRosters.filter(r => r.played === false && r.active === true)
  const inactivePlayers = teamRosters.filter(r => r.active === false)

  // Group PLAYED players by position for depth chart
  const positionGroups = new Map<string, GameRoster[]>()
  for (const player of playedPlayers) {
    const pos = normalizePosition(player.position || player.player?.primary_position)
    if (!positionGroups.has(pos)) {
      positionGroups.set(pos, [])
    }
    positionGroups.get(pos)!.push(player)
  }

  // Sort positions by order, then sort players within each position by jersey number
  const sortedPositions = Array.from(positionGroups.keys()).sort(
    (a, b) => getPositionOrder(a) - getPositionOrder(b)
  )

  // Sort players within each position group by jersey number
  for (const pos of sortedPositions) {
    positionGroups.get(pos)!.sort((a, b) => {
      const jerseyA = a.jersey_number ?? a.player?.jersey_number ?? 99
      const jerseyB = b.jersey_number ?? b.player?.jersey_number ?? 99
      return jerseyA - jerseyB
    })
  }

  // Group positions by unit (Offense, Defense, Special Teams)
  const unitGroups = new Map<string, string[]>()
  for (const pos of sortedPositions) {
    const unit = getPositionGroup(pos)
    if (!unitGroups.has(unit)) {
      unitGroups.set(unit, [])
    }
    unitGroups.get(unit)!.push(pos)
  }

  const selectedTeamData = selectedTeam === homeTeamId ? homeTeam : awayTeam

  // Helper to format player display
  const formatPlayer = (roster: GameRoster): string => {
    const jersey = roster.jersey_number ?? roster.player?.jersey_number
    const name = roster.player?.full_name ?? `Player ${roster.player_id.replace('espn-', '')}`
    // Shorten name: "First Last" -> "F. Last"
    const parts = name.split(' ')
    if (parts.length >= 2) {
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ')
      return jersey ? `#${jersey} ${firstName[0]}. ${lastName}` : `${firstName[0]}. ${lastName}`
    }
    return jersey ? `#${jersey} ${name}` : name
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Game Day Depth Chart</CardTitle>
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
            {playedPlayers.length} Played
          </Badge>
          {dnpPlayers.length > 0 && (
            <Badge variant="outline" className="text-xs text-amber-600">
              {dnpPlayers.length} DNP
            </Badge>
          )}
          {inactivePlayers.length > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {inactivePlayers.length} Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Depth Chart by Unit */}
        {['Offense', 'Defense', 'Special Teams', 'Other'].map(unit => {
          const positions = unitGroups.get(unit)
          if (!positions || positions.length === 0) return null

          return (
            <div key={unit}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {unit}
              </h4>
              <div className="space-y-1.5">
                {positions.map(pos => {
                  const players = positionGroups.get(pos) || []
                  if (players.length === 0) return null

                  return (
                    <div key={pos} className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-mono w-10 justify-center shrink-0"
                      >
                        {pos}
                      </Badge>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                        {players.map((player, idx) => (
                          <span
                            key={player.game_roster_id}
                            className="text-foreground whitespace-nowrap"
                          >
                            {formatPlayer(player)}
                            {idx < players.length - 1 && (
                              <span className="text-muted-foreground ml-1">•</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Did Not Play - Dressed but didn't see field */}
        {dnpPlayers.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold text-amber-600 mb-2 uppercase tracking-wide">
              Did Not Play
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {dnpPlayers
                .sort((a, b) => getPositionOrder(a.position || a.player?.primary_position) -
                               getPositionOrder(b.position || b.player?.primary_position))
                .map((player, idx) => {
                  const pos = player.position || player.player?.primary_position || ''
                  return (
                    <span key={player.game_roster_id} className="whitespace-nowrap">
                      {formatPlayer(player)}
                      {pos && <span className="text-xs ml-1">({pos})</span>}
                      {idx < dnpPlayers.length - 1 && (
                        <span className="ml-1">•</span>
                      )}
                    </span>
                  )
                })}
            </div>
          </div>
        )}

        {/* Inactive Players - Declared inactive before game */}
        {inactivePlayers.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Inactive
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {inactivePlayers
                .sort((a, b) => getPositionOrder(a.position || a.player?.primary_position) -
                               getPositionOrder(b.position || b.player?.primary_position))
                .map((player, idx) => {
                  const pos = player.position || player.player?.primary_position || ''
                  return (
                    <span key={player.game_roster_id} className="whitespace-nowrap">
                      {formatPlayer(player)}
                      {pos && <span className="text-xs ml-1">({pos})</span>}
                      {idx < inactivePlayers.length - 1 && (
                        <span className="ml-1">•</span>
                      )}
                    </span>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
