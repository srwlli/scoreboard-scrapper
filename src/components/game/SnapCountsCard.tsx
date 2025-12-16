'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPlayerName } from '@/lib/utils'
import type { SnapCount, Team } from '@/types/game'

interface SnapCountsCardProps {
  snapCounts: SnapCount[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

type SnapUnit = 'offense' | 'defense' | 'st'

export function SnapCountsCard({
  snapCounts,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam
}: SnapCountsCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(awayTeamId)
  const [unit, setUnit] = useState<SnapUnit>('offense')

  const filteredSnaps = snapCounts.filter(s => s.team_id === selectedTeam)

  const offenseSnaps = filteredSnaps
    .filter(s => s.offense_snaps > 0)
    .sort((a, b) => b.offense_snaps - a.offense_snaps)

  const defenseSnaps = filteredSnaps
    .filter(s => s.defense_snaps > 0)
    .sort((a, b) => b.defense_snaps - a.defense_snaps)

  const stSnaps = filteredSnaps
    .filter(s => s.st_snaps > 0)
    .sort((a, b) => b.st_snaps - a.st_snaps)

  if (snapCounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Snap Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Snap count data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Snap Counts</CardTitle>
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
        <Tabs value={unit} onValueChange={(v) => setUnit(v as SnapUnit)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="offense">Offense</TabsTrigger>
            <TabsTrigger value="defense">Defense</TabsTrigger>
            <TabsTrigger value="st">Special Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="offense">
            {offenseSnaps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No offensive snap data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Pos</TableHead>
                    <TableHead className="text-right">Snaps</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offenseSnaps.map((s, idx) => (
                    <TableRow key={s.id ?? `${s.player_name}-${s.team_id}-off-${idx}`}>
                      <TableCell className="font-medium">{formatPlayerName(s.player_name)}</TableCell>
                      <TableCell>{s.position || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.offense_snaps}</TableCell>
                      <TableCell className="text-right tabular-nums">{(s.offense_pct * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="defense">
            {defenseSnaps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No defensive snap data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Pos</TableHead>
                    <TableHead className="text-right">Snaps</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defenseSnaps.map((s, idx) => (
                    <TableRow key={s.id ?? `${s.player_name}-${s.team_id}-def-${idx}`}>
                      <TableCell className="font-medium">{formatPlayerName(s.player_name)}</TableCell>
                      <TableCell>{s.position || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.defense_snaps}</TableCell>
                      <TableCell className="text-right tabular-nums">{(s.defense_pct * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="st">
            {stSnaps.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No special teams snap data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Pos</TableHead>
                    <TableHead className="text-right">Snaps</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stSnaps.map((s, idx) => (
                    <TableRow key={s.id ?? `${s.player_name}-${s.team_id}-st-${idx}`}>
                      <TableCell className="font-medium">{formatPlayerName(s.player_name)}</TableCell>
                      <TableCell>{s.position || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.st_snaps}</TableCell>
                      <TableCell className="text-right tabular-nums">{(s.st_pct * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
