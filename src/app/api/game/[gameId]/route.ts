import { NextResponse } from 'next/server'
import { getGameDetails } from '@/lib/queries/game-queries'

// Normalize game ID to database format (espn-{id})
function normalizeGameId(gameId: string): string {
  return gameId.startsWith('espn-') ? gameId : `espn-${gameId}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const data = await getGameDetails(normalizeGameId(gameId))

  if (!data) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
