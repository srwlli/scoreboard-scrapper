import { DashboardCard } from '@/components/dashboard-card'

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Scoreboard"
          description="View NFL scores and schedules"
          href="/scoreboard"
        />
      </div>
    </main>
  )
}
