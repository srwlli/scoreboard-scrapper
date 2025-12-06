'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdvancedStats, Team } from '@/types/game'

interface AdvancedStatsCardProps {
  stats: AdvancedStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

export function AdvancedStatsCard({
  stats,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam
}: AdvancedStatsCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(awayTeamId)

  const filteredStats = stats
    .filter(s => s.team_id === selectedTeam)
    .sort((a, b) => (b.target_share || 0) - (a.target_share || 0))

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Advanced stats data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Advanced Stats</CardTitle>
          <ToggleGroup
            type="single"
            value={selectedTeam}
            onValueChange={(v) => v && setSelectedTeam(v)}
          >
            <ToggleGroupItem value={awayTeamId} className="text-xs">
              {awayTeam.team_id}
            </ToggleGroupItem>
            <ToggleGroupItem value={homeTeamId} className="text-xs">
              {homeTeam.team_id}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStats.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No advanced stats for this team</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead className="text-right">Tgt%</TableHead>
                <TableHead className="text-right">AY%</TableHead>
                <TableHead className="text-right">WOPR</TableHead>
                <TableHead className="text-right">RACR</TableHead>
                <TableHead className="text-right">aDOT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.player_name}</TableCell>
                  <TableCell>{s.position || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">{((s.target_share || 0) * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{((s.air_yards_share || 0) * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{(s.wopr || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right tabular-nums">{(s.racr || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right tabular-nums">{(s.adot || 0).toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
