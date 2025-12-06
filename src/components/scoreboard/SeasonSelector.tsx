'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SeasonSelectorProps {
  value: number
  onChange: (season: number) => void
  availableSeasons: number[]
}

export function SeasonSelector({ value, onChange, availableSeasons }: SeasonSelectorProps) {
  return (
    <Select
      value={value.toString()}
      onValueChange={(v) => onChange(parseInt(v, 10))}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Season" />
      </SelectTrigger>
      <SelectContent>
        {availableSeasons.map((season) => (
          <SelectItem key={season} value={season.toString()}>
            {season}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
