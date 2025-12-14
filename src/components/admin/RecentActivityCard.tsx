'use client'

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
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  {entry.action}
                </Badge>
                <span className="font-medium">{entry.table_name}</span>
                {entry.description && (
                  <span className="text-sm text-muted-foreground">{entry.description}</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
