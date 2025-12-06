import { ScoreboardSkeleton } from '@/components/scoreboard'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold">NFL Scoreboard</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <ScoreboardSkeleton />
      </main>
    </div>
  )
}
