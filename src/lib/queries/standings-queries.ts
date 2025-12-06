import { createClient } from '@/lib/supabase/server'
import type { TeamStanding, DivisionStandings, StandingsData } from '@/types/game'

type Division = 'North' | 'South' | 'East' | 'West'
type Conference = 'AFC' | 'NFC'

const DIVISION_ORDER: Division[] = ['North', 'South', 'East', 'West']

export async function getStandings(season: number): Promise<StandingsData> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_season_stats')
    .select(`
      *,
      team:teams!team_id(*)
    `)
    .eq('season', season)
    .order('division_rank', { ascending: true })

  if (error) throw error

  const standings = (data || []) as TeamStanding[]

  // Group by conference and division
  const afcDivisions: DivisionStandings[] = []
  const nfcDivisions: DivisionStandings[] = []

  for (const division of DIVISION_ORDER) {
    const afcTeams = standings
      .filter(s => s.team?.conference === 'AFC' && s.team?.division === division)
      .sort((a, b) => a.division_rank - b.division_rank)

    const nfcTeams = standings
      .filter(s => s.team?.conference === 'NFC' && s.team?.division === division)
      .sort((a, b) => a.division_rank - b.division_rank)

    if (afcTeams.length > 0) {
      afcDivisions.push({
        conference: 'AFC',
        division,
        teams: afcTeams
      })
    }

    if (nfcTeams.length > 0) {
      nfcDivisions.push({
        conference: 'NFC',
        division,
        teams: nfcTeams
      })
    }
  }

  return {
    season,
    afc: afcDivisions,
    nfc: nfcDivisions
  }
}

export async function getConferenceStandings(
  season: number,
  conference: Conference
): Promise<TeamStanding[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_season_stats')
    .select(`
      *,
      team:teams!team_id(*)
    `)
    .eq('season', season)
    .order('conference_rank', { ascending: true })

  if (error) throw error

  return (data || [])
    .filter((s: TeamStanding) => s.team?.conference === conference)
    .sort((a: TeamStanding, b: TeamStanding) => a.conference_rank - b.conference_rank) as TeamStanding[]
}
