import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Thermometer, Wind, Droplets, Cloud } from 'lucide-react'
import type { GameWeather } from '@/types/game'

interface WeatherCardProps {
  weather: GameWeather | null
}

export function WeatherCard({ weather }: WeatherCardProps) {
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Indoor stadium or weather data unavailable</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weather</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {weather.temperature_fahrenheit}°F
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {weather.wind_speed_mph} mph {weather.wind_direction}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {weather.humidity_percentage}% humidity
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {weather.conditions}
            {weather.precipitation !== 'None' && ` • ${weather.precipitation}`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
