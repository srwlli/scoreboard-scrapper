import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'
import { getAdminDashboardData } from '@/lib/queries/admin-queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const initialData = await getAdminDashboardData()

  return <AdminDashboardClient initialData={initialData} />
}
