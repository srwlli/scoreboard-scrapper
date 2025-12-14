import { getAllInjuries } from '@/lib/queries/injuries-queries'
import { InjuriesCard } from '@/components/injuries/InjuriesCard'

export default async function InjuriesPage() {
  const injuries = await getAllInjuries(2025, 500)

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <InjuriesCard
        injuries={injuries}
        title="Week 14 Injury Report"
      />
    </main>
  )
}
