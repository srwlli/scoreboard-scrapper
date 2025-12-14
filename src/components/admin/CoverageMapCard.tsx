'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CoverageData } from '@/types/admin'

interface CoverageMapCardProps {
  data: CoverageData
}

export function CoverageMapCard({ data }: CoverageMapCardProps) {
  const { seasons, weeks, cells } = data

  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No coverage data available</p>
        </CardContent>
      </Card>
    )
  }

  // Create a lookup for quick cell access
  const cellMap = new Map(cells.map((c) => [`${c.season}-${c.week}`, c]))

  // Calculate totals
  const totalGames = cells.reduce((sum, c) => sum + c.game_count, 0)
  const weeksWithData = cells.filter((c) => c.has_data).length
  const totalPossible = seasons.length * weeks.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Coverage Map</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalGames.toLocaleString()} games across {weeksWithData}/{totalPossible} week slots
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Season</th>
                {weeks.map((week) => (
                  <th key={week} className="text-center px-1 py-1 font-medium text-muted-foreground">
                    W{week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr key={season}>
                  <td className="py-1 pr-2 font-medium">{season}</td>
                  {weeks.map((week) => {
                    const cell = cellMap.get(`${season}-${week}`)
                    const hasData = cell?.has_data || false
                    const gameCount = cell?.game_count || 0

                    return (
                      <td key={week} className="text-center px-1 py-1">
                        <div
                          className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-[10px] font-medium ${
                            hasData
                              ? gameCount >= 14
                                ? 'bg-green-500/30 text-green-700 dark:text-green-300'
                                : gameCount >= 10
                                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          title={hasData ? `${gameCount} games` : 'No data'}
                        >
                          {hasData ? gameCount : '-'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500/30" />
            <span>14+ games</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-green-500/20" />
            <span>10-13 games</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-yellow-500/20" />
            <span>&lt;10 games</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-muted" />
            <span>No data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
