import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Game } from '@/types/game'

interface TeamScheduleCardProps {
  schedule: Game[]
  teamId: string
}

export function TeamScheduleCard({ schedule, teamId }: TeamScheduleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Schedule</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedule data available</p>
        ) : (
          <div className="space-y-1">
            {schedule.map(game => {
              const isHome = game.home_team_id === teamId
              const opponent = isHome ? game.away_team : game.home_team
              const teamScore = isHome ? game.home_score : game.away_score
              const oppScore = isHome ? game.away_score : game.home_score
              const isFinal = game.status === 'final'

              let result: 'W' | 'L' | 'T' | null = null
              if (isFinal && teamScore !== null && oppScore !== null) {
                if (teamScore > oppScore) result = 'W'
                else if (teamScore < oppScore) result = 'L'
                else result = 'T'
              }

              return (
                <Link
                  key={game.game_id}
                  href={`/game/${game.game_id}`}
                  className="flex items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <span className="w-8 text-sm text-muted-foreground">
                    Wk {game.week}
                  </span>

                  <span className="w-8 text-xs text-muted-foreground">
                    {isHome ? 'vs' : '@'}
                  </span>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {opponent?.logo_url && (
                      <img
                        src={opponent.logo_url}
                        alt={opponent.team_abbr}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-sm truncate">
                      {opponent?.team_abbr || 'TBD'}
                    </span>
                  </div>

                  {isFinal ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                        className="w-6 justify-center"
                      >
                        {result}
                      </Badge>
                      <span className="text-sm font-mono w-14 text-right">
                        {teamScore}-{oppScore}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {game.status === 'scheduled' ? 'Upcoming' : game.status}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
