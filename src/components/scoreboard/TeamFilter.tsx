'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Team } from '@/types/game'

interface TeamFilterProps {
  value: string | null
  onChange: (teamId: string | null) => void
  teams: Team[]
}

export function TeamFilter({ value, onChange, teams }: TeamFilterProps) {
  // Sort teams alphabetically by name
  const sortedTeams = [...teams].sort((a, b) =>
    a.team_name.localeCompare(b.team_name)
  )

  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(v) => onChange(v === 'all' ? null : v)}
    >
      <SelectTrigger className="flex-1 min-w-0">
        <SelectValue placeholder="All Teams" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Teams</SelectItem>
        {sortedTeams.map((team) => (
          <SelectItem key={team.team_id} value={team.team_id}>
            {team.team_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
