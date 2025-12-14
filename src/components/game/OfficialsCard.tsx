import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GameOfficial } from '@/types/game'

interface OfficialsCardProps {
  officials: GameOfficial[]
}

// Standard NFL official positions in order
const POSITION_ORDER = [
  'Referee',
  'Umpire',
  'Down Judge',
  'Line Judge',
  'Field Judge',
  'Side Judge',
  'Back Judge'
]

export function OfficialsCard({ officials }: OfficialsCardProps) {
  if (!officials || officials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Officials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Officials information unavailable</p>
        </CardContent>
      </Card>
    )
  }

  // Sort officials by standard position order
  const sortedOfficials = [...officials].sort((a, b) => {
    const aIndex = POSITION_ORDER.indexOf(a.position)
    const bIndex = POSITION_ORDER.indexOf(b.position)
    // If position not in standard list, put at end
    const aSort = aIndex === -1 ? 999 : aIndex
    const bSort = bIndex === -1 ? 999 : bIndex
    return aSort - bSort
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Officials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedOfficials.map((official, index) => (
            <div key={official.id ?? `${official.position}-${index}`} className="flex justify-between items-center py-1.5 border-b last:border-b-0">
              <span className="text-sm text-muted-foreground">{official.position}</span>
              <span className="text-sm font-medium">{official.official_name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
