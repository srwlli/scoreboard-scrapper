import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GameRecap } from '@/types/game'

interface GameRecapCardProps {
  recap: GameRecap | null
}

export function GameRecapCard({ recap }: GameRecapCardProps) {
  if (!recap || (!recap.headline && !recap.summary)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Recap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Game recap not available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Game Recap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recap.headline && (
          <h3 className="font-semibold text-base leading-tight">{recap.headline}</h3>
        )}
        {recap.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">{recap.summary}</p>
        )}
        {recap.published_at && (
          <p className="text-xs text-muted-foreground">
            Published: {new Date(recap.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
