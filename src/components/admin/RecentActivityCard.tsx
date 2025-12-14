'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ActivityEntry } from '@/types/admin'

interface RecentActivityCardProps {
  data: ActivityEntry[]
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function RecentActivityCard({ data }: RecentActivityCardProps) {
  const [selectedTable, setSelectedTable] = useState<string>('all')

  // Get unique table names for filter
  const tableNames = useMemo(() => {
    const names = [...new Set(data.map((entry) => entry.table_name))].sort()
    return names
  }, [data])

  // Filter data by selected table
  const filteredData = useMemo(() => {
    if (selectedTable === 'all') return data
    return data.filter((entry) => entry.table_name === selectedTable)
  }, [data, selectedTable])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity detected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <span className="text-sm text-muted-foreground">
            {filteredData.length} {filteredData.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
          <button
            onClick={() => setSelectedTable('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTable === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            All
          </button>
          {tableNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedTable(name)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTable === name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredData.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No activity for selected table
            </p>
          ) : (
            filteredData.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    {entry.action}
                  </Badge>
                  <span className="font-medium shrink-0">{entry.table_name}</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {entry.metadata || entry.description}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0 ml-2">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
