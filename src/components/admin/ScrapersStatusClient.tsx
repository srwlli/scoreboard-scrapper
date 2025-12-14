'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TableFreshness } from '@/types/admin'

interface RecentGame {
  game_id: string
  status: string
  home_score: number | null
  away_score: number | null
  game_date: string
  week: number
  season: number
  home_team: { team_id: string; team_abbr: string }
  away_team: { team_id: string; team_abbr: string }
}

interface ScrapersData {
  recentGames: RecentGame[]
  freshness: TableFreshness[]
  statusCounts: { final: number; inProgress: number; scheduled: number }
  last_refresh: string
}

interface ScrapersStatusClientProps {
  initialData: ScrapersData
}

// Scraper schedule reference
const SCRAPER_SCHEDULE = [
  { name: 'Live Games Scraper', schedule: 'Every 30s (Game Windows)' },
  { name: 'Roster Updates', schedule: 'Daily @ 5:00 PM ET' },
  { name: 'Standings Scraper', schedule: 'Daily @ 7:00 AM ET' },
  { name: 'Betting Odds', schedule: 'Daily @ 10:00 AM ET' },
  { name: 'Advanced Analytics', schedule: 'Tuesdays @ 6:00 AM ET' },
  { name: 'Snap Counts', schedule: 'Tuesdays @ 7:00 AM ET' },
  { name: 'Player Stats (nflverse)', schedule: 'Tuesdays @ 8:00 AM ET' },
  { name: 'Next Gen Stats (All)', schedule: 'Tuesdays @ 9:00 AM ET' },
  { name: 'Schedule Refresh', schedule: 'Mondays @ 3:00 AM ET' },
]

// Scraper commands
const SCRAPER_COMMANDS = {
  coreGame: [
    { name: 'Live Games Scraper', command: 'npm run scrape:live' },
    { name: 'Game Stats (Current Week)', command: 'npm run scrape:game-stats -- --week=CURRENT' },
    { name: 'Game Weather', command: 'npm run scrape:weather' },
  ],
  teamPlayer: [
    { name: 'Roster Updates', command: 'npm run scrape:roster' },
    { name: 'Standings', command: 'npm run scrape:standings' },
    { name: 'Injuries', command: 'npm run scrape:injuries' },
    { name: 'Player Stats (nflverse)', command: 'npm run scrape:player-stats' },
  ],
  advanced: [
    { name: 'Advanced Analytics', command: 'npm run scrape:analytics' },
    { name: 'Snap Counts', command: 'npm run scrape:snap-counts' },
    { name: 'NGS Passing', command: 'npm run scrape:ngs-passing' },
    { name: 'NGS Rushing', command: 'npm run scrape:ngs-rushing' },
  ],
  other: [
    { name: 'Video Highlights (YouTube)', command: 'npx tsx scripts/scrape-videos.ts --season 2025' },
    { name: 'Betting Odds', command: 'npm run scrape:betting' },
    { name: 'Weekly Aggregation', command: 'npm run aggregate:weekly' },
  ],
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || 'unknown'

  if (normalized === 'final') {
    return (
      <Badge className="bg-green-900/50 text-green-300 border-green-800">
        FINAL
      </Badge>
    )
  }
  if (normalized === 'in_progress' || normalized === 'in progress') {
    return (
      <Badge className="bg-red-900/50 text-red-300 border-red-800 animate-pulse">
        LIVE
      </Badge>
    )
  }
  if (normalized === 'scheduled') {
    return (
      <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-800">
        SCHEDULED
      </Badge>
    )
  }
  return (
    <Badge className="bg-gray-900/50 text-gray-300 border-gray-800">
      {status || 'UNKNOWN'}
    </Badge>
  )
}

function CommandButton({
  name,
  command,
  variant,
}: {
  name: string
  command: string
  variant: 'blue' | 'green' | 'purple' | 'yellow' | 'slate'
}) {
  const colors = {
    blue: 'bg-blue-900/40 hover:bg-blue-800 text-blue-200 border-blue-800',
    green: 'bg-green-900/40 hover:bg-green-800 text-green-200 border-green-800',
    purple: 'bg-purple-900/40 hover:bg-purple-800 text-purple-200 border-purple-800',
    yellow: 'bg-yellow-900/40 hover:bg-yellow-800 text-yellow-200 border-yellow-800',
    slate: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600',
  }

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(command)
        alert(`Copied to clipboard:\n${command}`)
      }}
      className={`w-full text-left ${colors[variant]} border py-2 px-3 rounded transition text-sm`}
    >
      ▶ {name}
    </button>
  )
}

export function ScrapersStatusClient({ initialData }: ScrapersStatusClientProps) {
  const [data, setData] = useState<ScrapersData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/scrapers')
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        setLastRefresh(new Date())
        setSecondsUntilRefresh(30)
      }
    } catch (error) {
      console.error('Failed to refresh scrapers data:', error)
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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Scrapers Status</h1>
          <p className="text-muted-foreground">
            NFL Stats Platform &bull; System Status
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Last Updated</div>
          <div className="font-mono text-green-400">
            {lastRefresh.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            {isRefreshing && (
              <Badge variant="outline" className="animate-pulse">
                Refreshing...
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Next in {secondsUntilRefresh}s
            </span>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Scheduler Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xl font-bold text-green-400 bg-green-900/30 p-2 rounded border border-green-900">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse" />
              ACTIVE
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Monitored via PM2 "nfl-scheduler"
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xl font-bold text-blue-400">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2" />
              CONNECTED
            </div>
            <p className="text-xs text-muted-foreground mt-2">Supabase Production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Game Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-2xl font-bold text-red-400">
                  {data.statusCounts.inProgress}
                </span>
                <span className="text-muted-foreground ml-1">Live</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-400">
                  {data.statusCounts.final}
                </span>
                <span className="text-muted-foreground ml-1">Final</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-yellow-400">
                  {data.statusCounts.scheduled}
                </span>
                <span className="text-muted-foreground ml-1">Upcoming</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games and Data Freshness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Games Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2">Game</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentGames.map((game) => (
                    <tr key={game.game_id}>
                      <td className="py-2 font-medium">
                        {game.away_team?.team_abbr || '?'} @{' '}
                        {game.home_team?.team_abbr || '?'}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={game.status} />
                      </td>
                      <td className="py-2 font-mono text-muted-foreground">
                        {game.away_score ?? 0} - {game.home_score ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Freshness (Live Tables)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.freshness
                .filter((f) =>
                  ['games', 'live_plays', 'live_drives', 'win_probability'].includes(
                    f.table_name
                  )
                )
                .map((item) => (
                  <div
                    key={item.table_name}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{item.display_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {item.row_count.toLocaleString()} rows
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'fresh'
                            ? 'bg-green-500/20 text-green-400'
                            : item.status === 'aging'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manual Controls & Scrapers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Core Game Data
              </h3>
              <div className="space-y-2">
                {SCRAPER_COMMANDS.coreGame.map((cmd) => (
                  <CommandButton
                    key={cmd.name}
                    name={cmd.name}
                    command={cmd.command}
                    variant="blue"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Team & Player Data
              </h3>
              <div className="space-y-2">
                {SCRAPER_COMMANDS.teamPlayer.map((cmd) => (
                  <CommandButton
                    key={cmd.name}
                    name={cmd.name}
                    command={cmd.command}
                    variant="green"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Advanced Metrics
              </h3>
              <div className="space-y-2">
                {SCRAPER_COMMANDS.advanced.map((cmd) => (
                  <CommandButton
                    key={cmd.name}
                    name={cmd.name}
                    command={cmd.command}
                    variant="purple"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Media & System
              </h3>
              <div className="space-y-2">
                {SCRAPER_COMMANDS.other.map((cmd) => (
                  <CommandButton
                    key={cmd.name}
                    name={cmd.name}
                    command={cmd.command}
                    variant={cmd.name.includes('Video') ? 'yellow' : 'slate'}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-muted-foreground">
                * Click buttons to copy command to clipboard. Run in terminal in
                next-scraper directory.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Schedule Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {SCRAPER_SCHEDULE.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{item.schedule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
