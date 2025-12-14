import { getTeamById, getTeamTransactions } from '@/lib/queries/teams-queries'
import { TransactionsCard } from '@/components/transactions/TransactionsCard'
import { notFound } from 'next/navigation'

interface TeamPageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params

  const [team, transactions] = await Promise.all([
    getTeamById(teamId.toUpperCase()),
    getTeamTransactions(teamId.toUpperCase(), 50)
  ])

  if (!team) {
    notFound()
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{team.team_name}</h1>
        <p className="text-muted-foreground">
          {team.conference} {team.division}
        </p>
      </div>

      <TransactionsCard
        transactions={transactions}
        title={`${team.team_abbr} Transactions`}
        showTeam={false}
        maxHeight="600px"
      />
    </main>
  )
}
