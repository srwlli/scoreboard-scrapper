import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DivisionStandings } from '@/types/game'

interface DivisionTableProps {
  division: DivisionStandings
}

export function DivisionTable({ division }: DivisionTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {division.conference} {division.division}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">T</TableHead>
              <TableHead className="text-center hidden sm:table-cell">PCT</TableHead>
              <TableHead className="text-center hidden sm:table-cell">PF</TableHead>
              <TableHead className="text-center hidden sm:table-cell">PA</TableHead>
              <TableHead className="text-center">DIFF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {division.teams.map((standing) => (
              <TableRow key={standing.team_id}>
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
                <TableCell className="text-center hidden sm:table-cell">{(standing.win_percentage * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-center hidden sm:table-cell">{standing.points_for}</TableCell>
                <TableCell className="text-center hidden sm:table-cell">{standing.points_against}</TableCell>
                <TableCell className={`text-center ${standing.point_differential > 0 ? 'text-green-600 dark:text-green-400' : standing.point_differential < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {standing.point_differential > 0 ? '+' : ''}{standing.point_differential}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
