'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PlayerInjury } from '@/types/game'

interface InjuriesCardProps {
  injuries: PlayerInjury[]
  title?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function InjuriesCard({
  injuries,
  title = 'Injury Report',
}: InjuriesCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all')

  // Get unique teams from injuries
  const teams = useMemo(() => {
    const teamSet = new Set<string>()
    injuries.forEach(injury => {
      if (injury.player?.current_team_id) {
        teamSet.add(injury.player.current_team_id)
      }
    })
    return Array.from(teamSet).sort()
  }, [injuries])

  // Filter injuries by selected team
  const filteredInjuries = useMemo(() => {
    if (selectedTeam === 'all') return injuries
    return injuries.filter(injury => injury.player?.current_team_id === selectedTeam)
  }, [injuries, selectedTeam])

  // Sort by team, then by player name
  const sortedInjuries = useMemo(() => {
    return [...filteredInjuries].sort((a, b) => {
      const teamA = a.player?.current_team_id || ''
      const teamB = b.player?.current_team_id || ''
      if (teamA !== teamB) return teamA.localeCompare(teamB)
      const nameA = a.player?.full_name || ''
      const nameB = b.player?.full_name || ''
      return nameA.localeCompare(nameB)
    })
  }, [filteredInjuries])

  if (!injuries || injuries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No injuries reported</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {sortedInjuries.length} injured
            </Badge>
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Team</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="w-16">Pos</TableHead>
                <TableHead>Injury</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInjuries.map(injury => (
                <TableRow key={injury.injury_id}>
                  <TableCell className="font-medium">
                    {injury.player?.current_team_id || '-'}
                  </TableCell>
                  <TableCell>{injury.player?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{injury.player?.primary_position || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {injury.injury_type || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {injury.injury_description || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
