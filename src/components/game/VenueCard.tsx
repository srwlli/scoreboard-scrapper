import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Stadium } from '@/types/game'

interface VenueCardProps {
  stadium: Stadium | null
  attendance?: number | null
}

export function VenueCard({ stadium, attendance }: VenueCardProps) {
  if (!stadium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No venue data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Venue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-bold">{stadium.stadium_name || '--'}</p>
        <p className="text-sm text-muted-foreground">
          {stadium.city || ''}{stadium.state ? `, ${stadium.state}` : ''}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          <div>
            <span className="text-muted-foreground">Attendance:</span>{' '}
            {attendance?.toLocaleString() || '--'}
          </div>
          <div>
            <span className="text-muted-foreground">Capacity:</span>{' '}
            {stadium.capacity?.toLocaleString() || '--'}
          </div>
          <div>
            <span className="text-muted-foreground">Surface:</span>{' '}
            {stadium.surface_type || '--'}
          </div>
          <div>
            <span className="text-muted-foreground">Roof:</span>{' '}
            {stadium.roof_type || '--'}
          </div>
          {stadium.opened_year && (
            <div>
              <span className="text-muted-foreground">Opened:</span>{' '}
              {stadium.opened_year}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
