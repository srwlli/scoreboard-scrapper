'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TableFreshness, FreshnessStatus } from '@/types/admin'

interface DataFreshnessCardProps {
  data: TableFreshness[]
}

const STATUS_COLORS: Record<FreshnessStatus, string> = {
  fresh: 'bg-green-500/20 text-green-600 dark:text-green-400',
  aging: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  stale: 'bg-red-500/20 text-red-600 dark:text-red-400',
  unknown: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
}

const STATUS_LABELS: Record<FreshnessStatus, string> = {
  fresh: 'Fresh',
  aging: 'Aging',
  stale: 'Stale',
  unknown: 'Unknown',
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return 'Never'

  const now = new Date()
  const updated = new Date(timestamp)
  const diffMs = now.getTime() - updated.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function DataFreshnessCard({ data }: DataFreshnessCardProps) {
  // Group by status for summary
  const statusCounts = data.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    },
    {} as Record<FreshnessStatus, number>
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Data Freshness</span>
          <div className="flex gap-2 text-sm font-normal">
            {statusCounts.fresh > 0 && (
              <Badge variant="outline" className={STATUS_COLORS.fresh}>
                {statusCounts.fresh} Fresh
              </Badge>
            )}
            {statusCounts.aging > 0 && (
              <Badge variant="outline" className={STATUS_COLORS.aging}>
                {statusCounts.aging} Aging
              </Badge>
            )}
            {statusCounts.stale > 0 && (
              <Badge variant="outline" className={STATUS_COLORS.stale}>
                {statusCounts.stale} Stale
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.table_name}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={STATUS_COLORS[item.status]}>
                  {STATUS_LABELS[item.status]}
                </Badge>
                <span className="font-medium">{item.display_name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{item.row_count.toLocaleString()} rows</span>
                <span className="w-20 text-right">{formatTimeAgo(item.last_updated)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
