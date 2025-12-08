import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Game, Team } from '@/types/game'

interface CoinTossCardProps {
  game: Pick<Game, 'coin_toss_winner_team_id' | 'coin_toss_decision'>
  homeTeam: Team
  awayTeam: Team
}

export function CoinTossCard({ game, homeTeam, awayTeam }: CoinTossCardProps) {
  if (!game.coin_toss_winner_team_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coin Toss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coin toss information unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const winnerTeam = game.coin_toss_winner_team_id === homeTeam.team_id ? homeTeam : awayTeam
  const decision = game.coin_toss_decision?.toLowerCase() || 'unknown'

  // Format decision for display
  const decisionDisplay = decision.charAt(0).toUpperCase() + decision.slice(1)

  // Get badge variant based on decision
  const getBadgeVariant = () => {
    switch (decision) {
      case 'receive':
        return 'default'
      case 'defer':
        return 'secondary'
      case 'kick':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Coin Toss</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Winner</span>
          <span className="font-semibold">{winnerTeam.team_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Decision</span>
          <Badge variant={getBadgeVariant()}>{decisionDisplay}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
