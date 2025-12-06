'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WeekSelectorProps {
  value: number
  onChange: (week: number) => void
  maxWeek: number
}

export function WeekSelector({ value, onChange, maxWeek }: WeekSelectorProps) {
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)

  return (
    <Select
      value={value.toString()}
      onValueChange={(v) => onChange(parseInt(v, 10))}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Week" />
      </SelectTrigger>
      <SelectContent>
        {weeks.map((week) => (
          <SelectItem key={week} value={week.toString()}>
            Week {week}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
