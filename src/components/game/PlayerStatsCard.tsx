'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPlayerName } from '@/lib/utils'
import type { PlayerGameStats, Team } from '@/types/game'

interface PlayerStatsCardProps {
  playerStats: PlayerGameStats[]
  homeTeamId: string
  awayTeamId: string
  homeTeam: Team
  awayTeam: Team
}

type StatCategory = 'passing' | 'rushing' | 'receiving' | 'defense' | 'kicking' | 'punting' | 'returns'

export function PlayerStatsCard({
  playerStats,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam
}: PlayerStatsCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(awayTeamId)
  const [category, setCategory] = useState<StatCategory>('passing')

  const filteredStats = playerStats.filter(p => p.team_id === selectedTeam)

  const passingStats = filteredStats
    .filter(p => p.passing_attempts > 0)
    .sort((a, b) => b.passing_yards - a.passing_yards)

  const rushingStats = filteredStats
    .filter(p => p.rushing_attempts > 0)
    .sort((a, b) => b.rushing_yards - a.rushing_yards)

  const receivingStats = filteredStats
    .filter(p => p.receptions > 0 || p.receiving_targets > 0)
    .sort((a, b) => b.receiving_yards - a.receiving_yards)

  const defenseStats = filteredStats
    .filter(p => p.tackles_total > 0 || p.sacks > 0 || p.interceptions > 0)
    .sort((a, b) => b.tackles_total - a.tackles_total)

  const kickingStats = filteredStats
    .filter(p => p.field_goals_attempted > 0 || p.extra_points_attempted > 0)

  const puntingStats = filteredStats
    .filter(p => p.punts > 0)

  // Return stats (kick and punt returns combined)
  const returnStats = filteredStats
    .filter(p => (p.kick_return_attempts > 0) || (p.punt_return_attempts > 0))
    .sort((a, b) => {
      const aYards = (a.kick_return_yards || 0) + (a.punt_return_yards_total || 0)
      const bYards = (b.kick_return_yards || 0) + (b.punt_return_yards_total || 0)
      return bYards - aYards
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Player Stats</CardTitle>
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
        <Tabs value={category} onValueChange={(v) => setCategory(v as StatCategory)}>
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="passing" className="text-xs">Pass</TabsTrigger>
            <TabsTrigger value="rushing" className="text-xs">Rush</TabsTrigger>
            <TabsTrigger value="receiving" className="text-xs">Rec</TabsTrigger>
            <TabsTrigger value="defense" className="text-xs">Def</TabsTrigger>
            <TabsTrigger value="kicking" className="text-xs">Kick</TabsTrigger>
            <TabsTrigger value="punting" className="text-xs">Punt</TabsTrigger>
            <TabsTrigger value="returns" className="text-xs">Ret</TabsTrigger>
          </TabsList>

          <TabsContent value="passing">
            {passingStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No passing stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">C/A</TableHead>
                    <TableHead className="text-right">Yds</TableHead>
                    <TableHead className="text-right">TD</TableHead>
                    <TableHead className="text-right">INT</TableHead>
                    <TableHead className="text-right">RTG</TableHead>
                    <TableHead className="text-right">QBR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passingStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passing_completions}/{p.passing_attempts}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passing_yards}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passing_touchdowns}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passing_interceptions}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passer_rating?.toFixed(1) ?? '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.qbr?.toFixed(1) ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="rushing">
            {rushingStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No rushing stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Att</TableHead>
                    <TableHead className="text-right">Yds</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">TD</TableHead>
                    <TableHead className="text-right">Lng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rushingStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.rushing_attempts}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.rushing_yards}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.rushing_attempts > 0 ? (p.rushing_yards / p.rushing_attempts).toFixed(1) : '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.rushing_touchdowns}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.rushing_longest}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="receiving">
            {receivingStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No receiving stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Rec</TableHead>
                    <TableHead className="text-right">Tgt</TableHead>
                    <TableHead className="text-right">Yds</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">TD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivingStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.receptions}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.receiving_targets}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.receiving_yards}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.receptions > 0 ? (p.receiving_yards / p.receptions).toFixed(1) : '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.receiving_touchdowns}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="defense">
            {defenseStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No defensive stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Tkl</TableHead>
                    <TableHead className="text-right">Solo</TableHead>
                    <TableHead className="text-right">Sck</TableHead>
                    <TableHead className="text-right">INT</TableHead>
                    <TableHead className="text-right">PD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defenseStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.tackles_total}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.tackles_solo}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.sacks}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.interceptions}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.passes_defended}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="kicking">
            {kickingStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No kicking stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">FG</TableHead>
                    <TableHead className="text-right">0-39</TableHead>
                    <TableHead className="text-right">40-49</TableHead>
                    <TableHead className="text-right">50+</TableHead>
                    <TableHead className="text-right">Lng</TableHead>
                    <TableHead className="text-right">XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kickingStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.field_goals_made}/{p.field_goals_attempted}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.field_goals_0_39 || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.field_goals_40_49 || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.field_goals_50_plus || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.field_goal_longest}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.extra_points_made}/{p.extra_points_attempted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="punting">
            {puntingStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No punting stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Punts</TableHead>
                    <TableHead className="text-right">Yds</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">I20</TableHead>
                    <TableHead className="text-right">Lng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {puntingStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punts}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punt_yards}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punt_average?.toFixed(1) ?? '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punts_inside_20}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punt_longest}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="returns">
            {returnStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No return stats</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">KR</TableHead>
                    <TableHead className="text-right">KR Yds</TableHead>
                    <TableHead className="text-right">PR</TableHead>
                    <TableHead className="text-right">PR Yds</TableHead>
                    <TableHead className="text-right">TD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnStats.map((p) => (
                    <TableRow key={p.player_game_id}>
                      <TableCell className="font-medium">{formatPlayerName(p.player?.full_name) || `#${p.player_id.replace('espn-', '')}`}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.kick_return_attempts || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.kick_return_yards || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punt_return_attempts || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.punt_return_yards_total || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{(p.kick_return_tds || 0) + (p.punt_return_tds || 0)}</TableCell>
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
