'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataFreshnessCard } from './DataFreshnessCard'
import { TableStatsCard } from './TableStatsCard'
import { CoverageMapCard } from './CoverageMapCard'
import { RecentActivityCard } from './RecentActivityCard'
import type { AdminDashboardData } from '@/types/admin'

interface AdminDashboardClientProps {
  initialData: AdminDashboardData
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [data, setData] = useState<AdminDashboardData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        setLastRefresh(new Date())
        setSecondsUntilRefresh(30)
      }
    } catch (error) {
      console.error('Failed to refresh admin data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          refreshData()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [refreshData])

  // Calculate summary stats
  const totalRows = data.stats.reduce((sum, t) => sum + t.row_count, 0)
  const freshCount = data.freshness.filter((f) => f.status === 'fresh').length
  const staleCount = data.freshness.filter((f) => f.status === 'stale').length
  const tableCount = data.stats.length

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System health and data monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRefreshing && (
              <Badge variant="outline" className="animate-pulse">
                Refreshing...
              </Badge>
            )}
            <div className="text-sm text-muted-foreground">
              Next refresh in {secondsUntilRefresh}s
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalRows.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{tableCount}</div>
              <div className="text-sm text-muted-foreground">Tables Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{freshCount}</div>
              <div className="text-sm text-muted-foreground">Fresh Tables</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${staleCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {staleCount}
              </div>
              <div className="text-sm text-muted-foreground">Stale Tables</div>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataFreshnessCard data={data.freshness} />
        <TableStatsCard data={data.stats} />
      </div>

      <div className="mt-6">
        <CoverageMapCard data={data.coverage} />
      </div>

      <div className="mt-6">
        <RecentActivityCard data={data.activity} />
      </div>
    </main>
  )
}
