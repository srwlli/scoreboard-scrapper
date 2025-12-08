'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WinProbability, Team } from '@/types/game'

interface WinProbabilityChartProps {
  data: WinProbability[]
  homeTeam: Team
  awayTeam: Team
}

// Chart dimensions
const CHART_WIDTH = 600
const CHART_HEIGHT = 250
const PADDING = { top: 20, right: 20, bottom: 40, left: 50 }
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

function formatQuarter(quarter: number | null): string {
  if (!quarter) return ''
  if (quarter === 5) return 'OT'
  return `Q${quarter}`
}

function getTeamLogoUrl(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`
}

export function WinProbabilityChart({ data, homeTeam, awayTeam }: WinProbabilityChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<WinProbability | null>(null)

  // Compute the SVG path and quarter markers
  const { pathD, quarterMarkers, maxSeq } = useMemo(() => {
    if (data.length === 0) return { pathD: '', quarterMarkers: [], maxSeq: 0 }

    const maxSeq = Math.max(...data.map(d => d.sequence_number))

    // Build the SVG path
    const points = data.map(d => {
      const x = PADDING.left + (d.sequence_number / maxSeq) * INNER_WIDTH
      const y = PADDING.top + (1 - d.home_win_pct) * INNER_HEIGHT
      return { x, y, data: d }
    })

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')

    // Find quarter boundaries
    const quarters: { quarter: number; x: number }[] = []
    let lastQuarter = 0
    data.forEach(d => {
      if (d.quarter && d.quarter !== lastQuarter) {
        const x = PADDING.left + (d.sequence_number / maxSeq) * INNER_WIDTH
        quarters.push({ quarter: d.quarter, x })
        lastQuarter = d.quarter
      }
    })

    return { pathD, quarterMarkers: quarters, maxSeq }
  }, [data])

  // Handle mouse/touch to find closest point
  const handleInteraction = (clientX: number, svg: SVGSVGElement) => {
    if (data.length === 0 || maxSeq === 0) return

    const rect = svg.getBoundingClientRect()
    const scaleX = CHART_WIDTH / rect.width
    const svgX = (clientX - rect.left) * scaleX

    // Convert to data coordinates
    const dataX = ((svgX - PADDING.left) / INNER_WIDTH) * maxSeq

    // Find closest point
    let closestPoint = data[0]
    let closestDist = Infinity
    data.forEach(d => {
      const dist = Math.abs(d.sequence_number - dataX)
      if (dist < closestDist) {
        closestDist = dist
        closestPoint = d
      }
    })

    setHoveredPoint(closestPoint)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    handleInteraction(e.clientX, e.currentTarget)
  }

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.currentTarget)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.currentTarget)
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Win Probability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No win probability data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate hovered point position for indicator
  const hoveredX = hoveredPoint
    ? PADDING.left + (hoveredPoint.sequence_number / maxSeq) * INNER_WIDTH
    : 0
  const hoveredY = hoveredPoint
    ? PADDING.top + (1 - hoveredPoint.home_win_pct) * INNER_HEIGHT
    : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Win Probability</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <img
                src={getTeamLogoUrl(homeTeam.team_id)}
                alt={homeTeam.team_name}
                className="w-5 h-5"
              />
              <span className="font-medium">{homeTeam.team_abbr}</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={getTeamLogoUrl(awayTeam.team_id)}
                alt={awayTeam.team_name}
                className="w-5 h-5"
              />
              <span className="text-muted-foreground">{awayTeam.team_abbr}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Fixed info bar - updates on touch/hover */}
        <div className="bg-muted/50 rounded-lg p-3 mb-3 min-h-[60px] flex items-center justify-center">
          {hoveredPoint ? (
            <div className="flex items-center justify-between w-full gap-4">
              {/* Game situation */}
              <div className="text-center flex-1">
                <div className="text-xs text-muted-foreground">
                  {formatQuarter(hoveredPoint.quarter)} {hoveredPoint.game_clock || ''}
                </div>
                {(hoveredPoint.home_score !== null && hoveredPoint.away_score !== null) && (
                  <div className="font-medium text-sm">
                    {awayTeam.team_abbr} {hoveredPoint.away_score} - {hoveredPoint.home_score} {homeTeam.team_abbr}
                  </div>
                )}
              </div>
              {/* Win probabilities */}
              <div className="flex items-center gap-4">
                <div className={`text-center ${hoveredPoint.home_win_pct > 0.5 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className="text-xs">{homeTeam.team_abbr}</div>
                  <div className="font-bold text-lg">{(hoveredPoint.home_win_pct * 100).toFixed(0)}%</div>
                </div>
                <div className={`text-center ${hoveredPoint.away_win_pct > 0.5 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className="text-xs">{awayTeam.team_abbr}</div>
                  <div className="font-bold text-lg">{(hoveredPoint.away_win_pct * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Tap or drag on chart to explore win probability
            </div>
          )}
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-auto touch-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseLeave}
          >
            {/* Background - split into two halves for team colors */}
            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={INNER_WIDTH}
              height={INNER_HEIGHT / 2}
              fill="currentColor"
              className="text-primary/5"
            />
            <rect
              x={PADDING.left}
              y={PADDING.top + INNER_HEIGHT / 2}
              width={INNER_WIDTH}
              height={INNER_HEIGHT / 2}
              fill="currentColor"
              className="text-muted/10"
            />

            {/* Team labels on left side */}
            <text
              x={PADDING.left + 5}
              y={PADDING.top + 15}
              className="fill-primary/70 text-[10px] font-medium"
            >
              ↑ {homeTeam.team_abbr}
            </text>
            <text
              x={PADDING.left + 5}
              y={PADDING.top + INNER_HEIGHT - 5}
              className="fill-muted-foreground/70 text-[10px] font-medium"
            >
              ↓ {awayTeam.team_abbr}
            </text>

            {/* 50% line */}
            <line
              x1={PADDING.left}
              y1={PADDING.top + INNER_HEIGHT / 2}
              x2={PADDING.left + INNER_WIDTH}
              y2={PADDING.top + INNER_HEIGHT / 2}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-muted-foreground/30"
            />

            {/* Quarter markers */}
            {quarterMarkers.map((q, i) => (
              <g key={i}>
                <line
                  x1={q.x}
                  y1={PADDING.top}
                  x2={q.x}
                  y2={PADDING.top + INNER_HEIGHT}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  className="text-muted-foreground/20"
                />
                <text
                  x={q.x}
                  y={CHART_HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {formatQuarter(q.quarter)}
                </text>
              </g>
            ))}

            {/* Y-axis labels */}
            <text
              x={PADDING.left - 10}
              y={PADDING.top + 5}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              100%
            </text>
            <text
              x={PADDING.left - 10}
              y={PADDING.top + INNER_HEIGHT / 2 + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              50%
            </text>
            <text
              x={PADDING.left - 10}
              y={PADDING.top + INNER_HEIGHT}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              0%
            </text>

            {/* Area fill under the line */}
            <path
              d={`${pathD} L ${PADDING.left + INNER_WIDTH} ${PADDING.top + INNER_HEIGHT} L ${PADDING.left} ${PADDING.top + INNER_HEIGHT} Z`}
              fill="currentColor"
              className="text-primary/10"
            />

            {/* Win probability line */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />

            {/* Hover indicator */}
            {hoveredPoint && (
              <>
                <line
                  x1={hoveredX}
                  y1={PADDING.top}
                  x2={hoveredX}
                  y2={PADDING.top + INNER_HEIGHT}
                  stroke="currentColor"
                  className="text-muted-foreground/50"
                />
                <circle
                  cx={hoveredX}
                  cy={hoveredY}
                  r="5"
                  fill="currentColor"
                  className="text-primary"
                />
              </>
            )}
          </svg>

        </div>

        {/* Final probability summary */}
        {data.length > 0 && (
          <div className="flex justify-between mt-4 pt-3 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Start</div>
              <div className="font-medium">
                {(data[0].home_win_pct * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Final</div>
              <div className="font-bold text-lg">
                {(data[data.length - 1].home_win_pct * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Swings</div>
              <div className="font-medium">
                {data.length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
