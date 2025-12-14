import Link from 'next/link'
import { getTeamsByDivision } from '@/lib/queries/teams-queries'
import { Card, CardContent } from '@/components/ui/card'

export default async function TeamsPage() {
  const teamsByDivision = await getTeamsByDivision()

  // Order divisions
  const divisionOrder = [
    'AFC East', 'AFC North', 'AFC South', 'AFC West',
    'NFC East', 'NFC North', 'NFC South', 'NFC West'
  ]

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">NFL Teams</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {divisionOrder.map(division => {
          const teams = teamsByDivision[division] || []
          if (teams.length === 0) return null

          return (
            <div key={division}>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                {division}
              </h2>
              <div className="space-y-2">
                {teams.map(team => (
                  <Link key={team.team_id} href={`/teams/${team.team_id}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        {team.logo_url && (
                          <img
                            src={team.logo_url}
                            alt={team.team_name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{team.team_name}</div>
                          <div className="text-xs text-muted-foreground">{team.team_abbr}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
