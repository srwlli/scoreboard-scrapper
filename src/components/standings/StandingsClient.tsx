'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHeader } from '@/components/header-context'
import { DivisionTable } from './DivisionTable'
import type { StandingsData } from '@/types/game'

interface StandingsClientProps {
  standings: StandingsData
  seasons: number[]
  currentSeason: number
}

export function StandingsClient({ standings, seasons, currentSeason }: StandingsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setHeader } = useHeader()

  const handleSeasonChange = (season: string) => {
    router.push(`/standings?season=${season}`)
  }

  // Set header
  useEffect(() => {
    setHeader({
      title: 'Standings',
      customContent: (
        <Select value={currentSeason.toString()} onValueChange={handleSeasonChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s} value={s.toString()}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    })
  }, [currentSeason, seasons, setHeader])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setHeader({ title: 'NFL Stats' })
    }
  }, [setHeader])

  const hasData = standings.afc.length > 0 || standings.nfc.length > 0

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No standings data available for {currentSeason}</p>
        <p className="text-sm text-muted-foreground mt-2">Run the standings scraper to populate data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="division" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="division">Division</TabsTrigger>
          <TabsTrigger value="conference">Conference</TabsTrigger>
          <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
        </TabsList>

        <TabsContent value="division" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AFC */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">AFC</h2>
              {standings.afc.map((div) => (
                <DivisionTable
                  key={`${div.conference}-${div.division}`}
                  division={div}
                />
              ))}
            </div>

            {/* NFC */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">NFC</h2>
              {standings.nfc.map((div) => (
                <DivisionTable
                  key={`${div.conference}-${div.division}`}
                  division={div}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conference" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AFC Conference */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">AFC</h2>
              <ConferenceTable
                teams={standings.afc.flatMap(d => d.teams).sort((a, b) => a.conference_rank - b.conference_rank)}
              />
            </div>

            {/* NFC Conference */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">NFC</h2>
              <ConferenceTable
                teams={standings.nfc.flatMap(d => d.teams).sort((a, b) => a.conference_rank - b.conference_rank)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="playoffs" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AFC Playoffs */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">AFC Playoff Picture</h2>
              <PlayoffBracket
                teams={standings.afc.flatMap(d => d.teams)}
                conference="AFC"
              />
            </div>

            {/* NFC Playoffs */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">NFC Playoff Picture</h2>
              <PlayoffBracket
                teams={standings.nfc.flatMap(d => d.teams)}
                conference="NFC"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TeamStanding } from '@/types/game'

function ConferenceTable({ teams }: { teams: TeamStanding[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">T</TableHead>
              <TableHead className="text-center">PCT</TableHead>
              <TableHead className="text-center hidden sm:table-cell">PF</TableHead>
              <TableHead className="text-center hidden sm:table-cell">PA</TableHead>
              <TableHead className="text-center hidden sm:table-cell">DIFF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((standing, idx) => {
              const isPlayoffSpot = standing.conference_rank <= 7
              const isDivisionLeader = standing.division_rank === 1

              return (
                <TableRow
                  key={standing.team_id}
                  className={isPlayoffSpot ? 'bg-green-500/5' : ''}
                >
                  <TableCell className="font-medium">
                    {standing.conference_rank}
                    {isDivisionLeader && <span className="text-xs text-muted-foreground ml-1">z</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://a.espncdn.com/i/teamlogos/nfl/500/${standing.team?.team_abbr?.toLowerCase()}.png`}
                        alt={standing.team?.team_name || ''}
                        className="h-6 w-6"
                        onError={(e) => {
                          e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
                        }}
                      />
                      <span className="font-medium">{standing.team?.team_abbr}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{standing.wins}</TableCell>
                  <TableCell className="text-center">{standing.losses}</TableCell>
                  <TableCell className="text-center">{standing.ties || '-'}</TableCell>
                  <TableCell className="text-center">{(standing.win_percentage * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{standing.points_for}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{standing.points_against}</TableCell>
                  <TableCell className={`text-center hidden sm:table-cell ${standing.point_differential > 0 ? 'text-green-600 dark:text-green-400' : standing.point_differential < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {standing.point_differential > 0 ? '+' : ''}{standing.point_differential}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PlayoffBracket({ teams, conference }: { teams: TeamStanding[], conference: 'AFC' | 'NFC' }) {
  // Sort teams: division winners first (by record), then wild cards
  const divisionWinners = teams
    .filter(t => t.division_rank === 1)
    .sort((a, b) => b.win_percentage - a.win_percentage || b.point_differential - a.point_differential)

  const wildCardTeams = teams
    .filter(t => t.division_rank !== 1)
    .sort((a, b) => b.win_percentage - a.win_percentage || b.point_differential - a.point_differential)
    .slice(0, 3)

  const inTheHunt = teams
    .filter(t => t.division_rank !== 1)
    .sort((a, b) => b.win_percentage - a.win_percentage || b.point_differential - a.point_differential)
    .slice(3, 6)

  const eliminated = teams
    .filter(t => !divisionWinners.includes(t) && !wildCardTeams.includes(t) && !inTheHunt.includes(t))

  const PlayoffTeamRow = ({ team, seed, label }: { team: TeamStanding, seed: number, label?: string }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/30">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-green-600 dark:text-green-400 w-6">{seed}</span>
        <img
          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team.team?.team_abbr?.toLowerCase()}.png`}
          alt={team.team?.team_name || ''}
          className="h-8 w-8"
          onError={(e) => {
            e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
          }}
        />
        <div>
          <span className="font-semibold">{team.team?.team_name}</span>
          {label && <span className="text-xs text-muted-foreground ml-2">{label}</span>}
        </div>
      </div>
      <span className="font-medium">{team.wins}-{team.losses}{team.ties ? `-${team.ties}` : ''}</span>
    </div>
  )

  const HuntTeamRow = ({ team, position }: { team: TeamStanding, position: number }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 dark:border-yellow-500/30">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400 w-6">{position}</span>
        <img
          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team.team?.team_abbr?.toLowerCase()}.png`}
          alt={team.team?.team_name || ''}
          className="h-8 w-8"
          onError={(e) => {
            e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
          }}
        />
        <span className="font-semibold">{team.team?.team_name}</span>
      </div>
      <span className="font-medium">{team.wins}-{team.losses}{team.ties ? `-${team.ties}` : ''}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Division Winners */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">&#x2713;</span> Division Leaders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {divisionWinners.map((team, idx) => (
            <PlayoffTeamRow
              key={team.team_id}
              team={team}
              seed={idx + 1}
              label={`${team.team?.division} Div`}
            />
          ))}
        </CardContent>
      </Card>

      {/* Wild Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">&#x2713;</span> Wild Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {wildCardTeams.map((team, idx) => (
            <PlayoffTeamRow
              key={team.team_id}
              team={team}
              seed={idx + 5}
            />
          ))}
        </CardContent>
      </Card>

      {/* In The Hunt */}
      {inTheHunt.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">&#x25CF;</span> In The Hunt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inTheHunt.map((team, idx) => (
              <HuntTeamRow
                key={team.team_id}
                team={team}
                position={idx + 8}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">&#x2717;</span> Out of Contention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eliminated.map((team) => (
                <div
                  key={team.team_id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/50 text-sm"
                >
                  <img
                    src={`https://a.espncdn.com/i/teamlogos/nfl/500/${team.team?.team_abbr?.toLowerCase()}.png`}
                    alt={team.team?.team_name || ''}
                    className="h-5 w-5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png'
                    }}
                  />
                  <span>{team.team?.team_abbr}</span>
                  <span className="text-muted-foreground">{team.wins}-{team.losses}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
