import { ScoreboardSkeleton } from '@/components/scoreboard'

export default function Loading() {
  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <ScoreboardSkeleton />
    </main>
  )
}
