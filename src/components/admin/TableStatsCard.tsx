'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TableStats } from '@/types/admin'

interface TableStatsCardProps {
  data: TableStats[]
}

export function TableStatsCard({ data }: TableStatsCardProps) {
  const totalRows = data.reduce((sum, t) => sum + t.row_count, 0)

  // Sort by row count descending
  const sorted = [...data].sort((a, b) => b.row_count - a.row_count)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Table Statistics</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalRows.toLocaleString()} total rows
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {sorted.map((item) => (
            <div
              key={item.table_name}
              className="flex items-center justify-between py-1.5 border-b"
            >
              <span className="text-sm">{item.display_name}</span>
              <span className="font-mono text-sm font-medium">
                {item.row_count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
