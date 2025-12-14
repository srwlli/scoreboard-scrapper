import { NextResponse } from 'next/server'
import { getAdminDashboardData } from '@/lib/queries/admin-queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const data = await getAdminDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
