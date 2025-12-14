import { NextResponse } from 'next/server'
import { getScrapersData } from '@/lib/queries/admin-queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const data = await getScrapersData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching scrapers data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scrapers data' },
      { status: 500 }
    )
  }
}
