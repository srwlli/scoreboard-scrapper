import { ScrapersStatusClient } from '@/components/admin/ScrapersStatusClient'
import { getScrapersData } from '@/lib/queries/admin-queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ScrapersPage() {
  const initialData = await getScrapersData()

  return <ScrapersStatusClient initialData={initialData} />
}
