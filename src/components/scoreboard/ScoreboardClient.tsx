'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { GameCard } from './GameCard'
import { SeasonSelector } from './SeasonSelector'
import { WeekSelector } from './WeekSelector'
import { TeamFilter } from './TeamFilter'
import { TeamScheduleHeader } from './TeamScheduleHeader'
import { ScoreboardSkeleton } from './ScoreboardSkeleton'
import { createClient } from '@/lib/supabase/client'
import { useHeader } from '@/components/header-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Team, ScoreboardGame, Game } from '@/types/game'

interface ScoreboardClientProps {
  initialTeams: Team[]
  initialSeasons: number[]
  initialGames: ScoreboardGame[]
  initialSeason: number
  initialWeek: number
  initialTeamId: string | null
  initialMaxWeek: number
}

export function ScoreboardClient({
  initialTeams,
  initialSeasons,
  initialGames,
  initialSeason,
  initialWeek,
  initialTeamId,
  initialMaxWeek,
}: ScoreboardClientProps) {
  const { setHeader } = useHeader()
  const [season, setSeason] = useState(initialSeason)
  const [week, setWeek] = useState(initialWeek)
  const [teamId, setTeamId] = useState<string | null>(initialTeamId)
  const [maxWeek, setMaxWeek] = useState(initialMaxWeek)
  const [games, setGames] = useState<ScoreboardGame[]>(initialGames)
  const [allSeasonGames, setAllSeasonGames] = useState<ScoreboardGame[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const selectedTeam = teamId ? initialTeams.find(t => t.team_id === teamId) : null

  // Calculate team record up to (not including) a given week
  const calculateTeamRecord = useCallback((teamIdToCheck: string, upToWeek: number): string => {
    let wins = 0, losses = 0, ties = 0
    allSeasonGames
      .filter(g => g.week < upToWeek && g.status === 'final')
      .filter(g => g.home_team_id === teamIdToCheck || g.away_team_id === teamIdToCheck)
      .forEach(g => {
        const isHome = g.home_team_id === teamIdToCheck
        const teamScore = isHome ? g.home_score : g.away_score
        const oppScore = isHome ? g.away_score : g.home_score
        if (teamScore !== null && oppScore !== null) {
          if (teamScore > oppScore) wins++
          else if (teamScore < oppScore) losses++
          else ties++
        }
      })
    return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`
  }, [allSeasonGames])
  const isTeamView = teamId !== null

  // Update URL hash
  const updateHash = useCallback((s: number, w: number, t: string | null) => {
    if (t) {
      window.location.hash = `${s}-team-${t}`
    } else {
      window.location.hash = `${s}-week${w}`
    }
  }, [])

  // Handle season change
  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason)
    setWeek(1)
    updateHash(newSeason, 1, teamId)
  }

  // Handle week change
  const handleWeekChange = (newWeek: number) => {
    setWeek(newWeek)
    updateHash(season, newWeek, teamId)
  }

  // Handle team filter change
  const handleTeamChange = (newTeamId: string | null) => {
    setTeamId(newTeamId)
    updateHash(season, week, newTeamId)
  }

  // Set header title only
  useEffect(() => {
    setHeader({ title: 'Scoreboard' })
    return () => {
      setHeader({ title: 'NFL Stats' })
    }
  }, [setHeader])

  // Fetch all season games for record calculation
  useEffect(() => {
    const fetchAllSeasonGames = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('games')
        .select(`
          game_id, season, week, status, home_team_id, away_team_id, home_score, away_score,
          home_team:teams!home_team_id(team_id, team_name, team_abbr),
          away_team:teams!away_team_id(team_id, team_name, team_abbr)
        `)
        .eq('season', season)
        .eq('status', 'final')
      setAllSeasonGames((data || []) as unknown as ScoreboardGame[])
    }
    fetchAllSeasonGames()
  }, [season])

  // Fetch games when season/week/team changes
  const fetchGames = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      if (teamId) {
        // Team schedule view
        const { data, error } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!home_team_id(*),
            away_team:teams!away_team_id(*)
          `)
          .eq('season', season)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order('week')

        if (error) throw error
        setGames((data || []) as ScoreboardGame[])
        setLastUpdated(new Date())
      } else {
        // Week view
        const { data, error } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!home_team_id(*),
            away_team:teams!away_team_id(*)
          `)
          .eq('season', season)
          .eq('week', week)
          .order('game_date')
          .order('game_time')

        if (error) throw error
        setGames((data || []) as ScoreboardGame[])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      setLoading(false)
    }
  }, [season, week, teamId])

  // Fetch games when filters change (but not on initial load)
  useEffect(() => {
    if (
      season !== initialSeason ||
      week !== initialWeek ||
      teamId !== initialTeamId
    ) {
      fetchGames()
    }
  }, [season, week, teamId, fetchGames, initialSeason, initialWeek, initialTeamId])

  // Parse hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const teamMatch = hash.match(/^(\d+)-team-(\w+)$/)
      const weekMatch = hash.match(/^(\d+)-week(\d+)$/)

      if (teamMatch) {
        const [, s, t] = teamMatch
        setSeason(parseInt(s, 10))
        setTeamId(t)
      } else if (weekMatch) {
        const [, s, w] = weekMatch
        setSeason(parseInt(s, 10))
        setWeek(parseInt(w, 10))
        setTeamId(null)
      }
    }
  }, [])

  // Real-time subscription for live game updates
  useEffect(() => {
    const hasLiveGames = games.some(g => g.status === 'in_progress')
    if (!hasLiveGames) return

    const supabase = createClient()

    // Subscribe to real-time changes on games table
    const channel = supabase
      .channel('live-games')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `status=eq.in_progress`
        },
        () => {
          // Refetch when any live game updates
          fetchGames()
        }
      )
      .subscribe()

    // Also poll every 30 seconds as backup
    const interval = setInterval(() => {
      fetchGames()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [games, fetchGames])

  // Sort games: live first, then scheduled, then completed
  const sortedGames = useMemo(() => {
    const statusOrder = { 'in_progress': 0, 'scheduled': 1, 'final': 2 }
    return [...games].sort((a, b) => {
      const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 1
      const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 1
      if (orderA !== orderB) return orderA - orderB
      // Within same status, sort by game time
      const timeA = `${a.game_date}T${a.game_time || '00:00'}`
      const timeB = `${b.game_date}T${b.game_time || '00:00'}`
      return timeA.localeCompare(timeB)
    })
  }, [games])

  const gameCount = games.length
  const liveCount = games.filter(g => g.status === 'in_progress').length
  const footerText = isTeamView
    ? `${selectedTeam?.team_name} | ${season} Season | ${gameCount} Games`
    : `NFL Scoreboard | ${season} Season | ${gameCount} Games`
  const lastUpdatedText = lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Filters */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <SeasonSelector
              value={season}
              onChange={handleSeasonChange}
              availableSeasons={initialSeasons}
            />
            {!isTeamView && (
              <WeekSelector
                value={week}
                onChange={handleWeekChange}
                maxWeek={maxWeek}
              />
            )}
            <TeamFilter
              value={teamId}
              onChange={handleTeamChange}
              teams={initialTeams}
            />
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'grid' | 'list')}
            >
              <SelectTrigger className="flex-1 min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-3 pb-6">
        {loading ? (
          <ScoreboardSkeleton />
        ) : isTeamView && selectedTeam ? (
          // Team Schedule View
          <div className="max-w-2xl mx-auto">
            <TeamScheduleHeader team={selectedTeam} games={games as Game[]} />
            <div className="flex flex-col gap-4">
              {games.map((game) => (
                <GameCard
                  key={game.game_id}
                  game={game}
                  homeTeam={game.home_team}
                  awayTeam={game.away_team}
                  showWeek
                  homeRecord={calculateTeamRecord(game.home_team_id, game.week)}
                  awayRecord={calculateTeamRecord(game.away_team_id, game.week)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Week View (Grid or List based on viewMode)
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-4 max-w-2xl mx-auto"
          }>
            {sortedGames.map((game) => (
              <GameCard
                key={game.game_id}
                game={game}
                homeTeam={game.home_team}
                awayTeam={game.away_team}
                homeRecord={calculateTeamRecord(game.home_team_id, game.week)}
                awayRecord={calculateTeamRecord(game.away_team_id, game.week)}
              />
            ))}
            {sortedGames.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No games scheduled for this week</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <div>{footerText}</div>
          {liveCount > 0 && (
            <div className="text-xs mt-1">
              🔴 {liveCount} live • Updated {lastUpdatedText}
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
