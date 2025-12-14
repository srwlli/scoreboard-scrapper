'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { RosterTransaction } from '@/types/game'

interface TransactionsCardProps {
  transactions: RosterTransaction[]
  title?: string
  maxHeight?: string
  showTeam?: boolean
}

function getTransactionColor(type: string): string {
  switch (type) {
    case 'signed':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'released':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'traded':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'waived':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'claimed':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

function getTransactionIcon(type: string): string {
  switch (type) {
    case 'signed':
      return '+'
    case 'released':
      return '-'
    case 'traded':
      return '⇄'
    case 'waived':
      return '✕'
    case 'claimed':
      return '↑'
    default:
      return '•'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function TransactionsCard({
  transactions,
  title = 'Recent Transactions',
  maxHeight = '400px',
  showTeam = true
}: TransactionsCardProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent transactions</p>
        </CardContent>
      </Card>
    )
  }

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, tx) => {
    const date = tx.transaction_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(tx)
    return acc
  }, {} as Record<string, RosterTransaction[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {transactions.length} moves
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="space-y-4">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                  {formatDate(date)}
                </div>
                <div className="space-y-2">
                  {groupedByDate[date].map(tx => (
                    <div
                      key={tx.transaction_id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getTransactionColor(tx.transaction_type)}`}>
                        {getTransactionIcon(tx.transaction_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {tx.player?.full_name || 'Unknown Player'}
                          </span>
                          {tx.player?.primary_position && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {tx.player.primary_position}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${getTransactionColor(tx.transaction_type)}`}
                          >
                            {tx.transaction_type}
                          </Badge>
                          {showTeam && tx.team && (
                            <span className="text-xs text-muted-foreground">
                              {tx.team.team_abbr}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
