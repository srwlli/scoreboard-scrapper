'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreboardTab } from './ScoreboardTab'
import { GameDetailsTab } from './GameDetailsTab'
import { StandingsTab } from './StandingsTab'
import { InjuriesTab } from './InjuriesTab'
import { TransactionsTab } from './TransactionsTab'
import { TeamsTab } from './TeamsTab'
import {
  getTotalFields,
  getUniqueTables,
  getUniqueSources,
  SOURCE_COLORS,
} from './data-maps-config'

export function DataMapsClient() {
  const fieldCounts = getTotalFields()
  const tables = getUniqueTables()
  const sources = getUniqueSources()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Data Maps</h1>
        <p className="text-muted-foreground">
          Complete data structure for each page in the application
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{fieldCounts.total}</div>
              <div className="text-sm text-muted-foreground">Total Fields</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{tables.length}</div>
              <div className="text-sm text-muted-foreground">Tables</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Scrapers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{sources.length}</div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4 pt-4 border-t">
            {sources.map((source) => (
              <Badge
                key={source}
                variant="outline"
                className={SOURCE_COLORS[source] || ''}
              >
                {source}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scoreboard" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="scoreboard" className="gap-2">
            Scoreboard
            <Badge variant="secondary" className="ml-1">{fieldCounts.scoreboard}</Badge>
          </TabsTrigger>
          <TabsTrigger value="game-details" className="gap-2">
            Game Details
            <Badge variant="secondary" className="ml-1">{fieldCounts.gameDetails}</Badge>
          </TabsTrigger>
          <TabsTrigger value="standings" className="gap-2">
            Standings
            <Badge variant="secondary" className="ml-1">{fieldCounts.standings}</Badge>
          </TabsTrigger>
          <TabsTrigger value="injuries" className="gap-2">
            Injuries
            <Badge variant="secondary" className="ml-1">{fieldCounts.injuries}</Badge>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            Transactions
            <Badge variant="secondary" className="ml-1">{fieldCounts.transactions}</Badge>
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2">
            Teams
            <Badge variant="secondary" className="ml-1">{fieldCounts.teams}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoreboard">
          <ScoreboardTab />
        </TabsContent>

        <TabsContent value="game-details">
          <GameDetailsTab />
        </TabsContent>

        <TabsContent value="standings">
          <StandingsTab />
        </TabsContent>

        <TabsContent value="injuries">
          <InjuriesTab />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
