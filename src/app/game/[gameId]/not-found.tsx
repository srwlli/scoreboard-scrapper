import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function GameNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Game Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            The game you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="default" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Scoreboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/#2024-week1">
                <Search className="h-4 w-4 mr-2" />
                Browse Games
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
