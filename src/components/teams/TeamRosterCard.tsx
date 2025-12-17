import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RosterPlayer } from '@/lib/queries/teams-queries'

interface TeamRosterCardProps {
  roster: RosterPlayer[]
  teamAbbr: string
}

const POSITION_ORDER = ['QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C', 'DL', 'DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'DB', 'CB', 'S', 'FS', 'SS', 'K', 'P', 'LS']

const POSITION_GROUPS: Record<string, string[]> = {
  'Offense': ['QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C', 'T', 'G'],
  'Defense': ['DL', 'DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'MLB', 'DB', 'CB', 'S', 'FS', 'SS'],
  'Special Teams': ['K', 'P', 'LS']
}

function getPositionGroup(position: string): string {
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(position)) return group
  }
  return 'Other'
}

export function TeamRosterCard({ roster, teamAbbr }: TeamRosterCardProps) {
  // Group players by position group
  const grouped: Record<string, RosterPlayer[]> = {}

  for (const player of roster) {
    const group = getPositionGroup(player.primary_position)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(player)
  }

  // Sort within each group by position order, then by name
  for (const group of Object.keys(grouped)) {
    grouped[group].sort((a, b) => {
      const aIdx = POSITION_ORDER.indexOf(a.primary_position)
      const bIdx = POSITION_ORDER.indexOf(b.primary_position)
      if (aIdx !== bIdx) return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
      return a.full_name.localeCompare(b.full_name)
    })
  }

  const groupOrder = ['Offense', 'Defense', 'Special Teams', 'Other']

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{teamAbbr} Roster ({roster.length})</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {roster.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roster data available</p>
        ) : (
          <div className="space-y-4">
            {groupOrder.map(group => {
              const players = grouped[group]
              if (!players || players.length === 0) return null

              return (
                <div key={group}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">{group}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {players.map(player => (
                      <div
                        key={player.player_id}
                        className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50"
                      >
                        <span className="w-6 text-right text-muted-foreground font-mono text-xs">
                          {player.jersey_number || '-'}
                        </span>
                        <span className="w-8 text-xs font-medium text-muted-foreground">
                          {player.primary_position}
                        </span>
                        <span className="truncate">{player.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
