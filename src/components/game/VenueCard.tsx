import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Ruler } from 'lucide-react'
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
          <p className="text-muted-foreground">Venue information unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Venue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">{stadium.stadium_name}</p>
            <p className="text-sm text-muted-foreground">
              {stadium.city}{stadium.state ? `, ${stadium.state}` : ''}
            </p>
          </div>
        </div>

        {attendance && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {attendance.toLocaleString()} attendance
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {stadium.surface_type} • {stadium.roof_type}
          </span>
        </div>

        {stadium.capacity && (
          <p className="text-xs text-muted-foreground">
            Capacity: {stadium.capacity.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
