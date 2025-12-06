'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { NGSPassing, NGSRushing, NGSReceiving, Team } from '@/types/game'

interface NGSStatsCardProps {
  passing: NGSPassing[]
  rushing: NGSRushing[]
  receiving: NGSReceiving[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

type StatType = 'passing' | 'rushing' | 'receiving'

export function NGSStatsCard({
  passing,
  rushing,
  receiving,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam
}: NGSStatsCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(awayTeamId)
  const [statType, setStatType] = useState<StatType>('passing')

  const filteredPassing = passing.filter(p => p.team_id === selectedTeam)
  const filteredRushing = rushing.filter(r => r.team_id === selectedTeam)
  const filteredReceiving = receiving.filter(r => r.team_id === selectedTeam)

  const hasData = passing.length > 0 || rushing.length > 0 || receiving.length > 0

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Gen Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Next Gen Stats data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Next Gen Stats</CardTitle>
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
        <Tabs value={statType} onValueChange={(v) => setStatType(v as StatType)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="passing">Passing</TabsTrigger>
            <TabsTrigger value="rushing">Rushing</TabsTrigger>
            <TabsTrigger value="receiving">Receiving</TabsTrigger>
          </TabsList>

          <TabsContent value="passing">
            {filteredPassing.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No NGS passing data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">TTT</TableHead>
                    <TableHead className="text-right">CPOE</TableHead>
                    <TableHead className="text-right">Agg%</TableHead>
                    <TableHead className="text-right">CAY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPassing.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.player_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.avg_time_to_throw.toFixed(2)}s</TableCell>
                      <TableCell className="text-right tabular-nums">{p.completion_percentage_above_expectation.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.aggressiveness.toFixed(1)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{p.avg_completed_air_yards.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="rushing">
            {filteredRushing.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No NGS rushing data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Eff</TableHead>
                    <TableHead className="text-right">8+ Def%</TableHead>
                    <TableHead className="text-right">RYOE</TableHead>
                    <TableHead className="text-right">RYOE/A</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRushing.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.player_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.efficiency.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.percent_attempts_gte_eight_defenders.toFixed(1)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{r.rush_yards_over_expected.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.rush_yards_over_expected_per_att.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="receiving">
            {filteredReceiving.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No NGS receiving data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Sep</TableHead>
                    <TableHead className="text-right">Catch%</TableHead>
                    <TableHead className="text-right">YAC</TableHead>
                    <TableHead className="text-right">YAC+</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceiving.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.player_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.avg_separation.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.catch_percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{r.avg_yac.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.avg_yac_above_expectation.toFixed(1)}</TableCell>
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
