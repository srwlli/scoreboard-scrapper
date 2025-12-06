'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GameCard } from './GameCard'
import { SeasonSelector } from './SeasonSelector'
import { WeekSelector } from './WeekSelector'
import { TeamFilter } from './TeamFilter'
import { TeamScheduleHeader } from './TeamScheduleHeader'
import { ScoreboardSkeleton } from './ScoreboardSkeleton'
import { createClient } from '@/lib/supabase/client'
import type { Team, ScoreboardGame, Game } from '@/types/game'
import { getCurrentWeek } from '@/types/game'

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
  const router = useRouter()
  const [season, setSeason] = useState(initialSeason)
  const [week, setWeek] = useState(initialWeek)
  const [teamId, setTeamId] = useState<string | null>(initialTeamId)
  const [maxWeek, setMaxWeek] = useState(initialMaxWeek)
  const [games, setGames] = useState<ScoreboardGame[]>(initialGames)
  const [loading, setLoading] = useState(false)

  const selectedTeam = teamId ? initialTeams.find(t => t.team_id === teamId) : null
  const isTeamView = teamId !== null

  // Update URL hash
  const updateHash = useCallback((s: number, w: number, t: string | null) => {
    if (t) {
      window.location.hash = `${s}-team-${t}`
    } else {
      window.location.hash = `${s}-week${w}`
    }
  }, [])

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
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      setLoading(false)
    }
  }, [season, week, teamId])

  // Handle season change
  const handleSeasonChange = (newSeason: number) => {
    setSeason(newSeason)
    setWeek(1) // Reset to week 1 when season changes
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

  // Fetch games when filters change (but not on initial load)
  useEffect(() => {
    // Skip initial fetch since we have initialGames
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
    const hash = window.location.hash.slice(1) // Remove #
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

  const gameCount = games.length
  const footerText = isTeamView
    ? `${selectedTeam?.team_name} | ${season} Season | ${gameCount} Games`
    : `NFL Scoreboard | ${season} Season | ${gameCount} Games`

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold">NFL Scoreboard</h1>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
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
                />
              ))}
            </div>
          </div>
        ) : (
          // Week View (Grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <GameCard
                key={game.game_id}
                game={game}
                homeTeam={game.home_team}
                awayTeam={game.away_team}
              />
            ))}
            {games.length === 0 && (
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
          {footerText}
        </div>
      </footer>
    </div>
  )
}
