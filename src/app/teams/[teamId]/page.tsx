import {
  getTeamById,
  getTeamTransactions,
  getTeamRecord,
  getTeamSchedule,
  getTeamRoster,
  getTeamStatLeaders
} from '@/lib/queries/teams-queries'
import { TransactionsCard } from '@/components/transactions/TransactionsCard'
import { TeamRecordCard } from '@/components/teams/TeamRecordCard'
import { TeamScheduleCard } from '@/components/teams/TeamScheduleCard'
import { TeamRosterCard } from '@/components/teams/TeamRosterCard'
import { TeamStatLeadersCard } from '@/components/teams/TeamStatLeadersCard'
import { notFound } from 'next/navigation'

interface TeamPageProps {
  params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params
  const upperTeamId = teamId.toUpperCase()

  const [team, transactions, record, schedule, roster, statLeaders] = await Promise.all([
    getTeamById(upperTeamId),
    getTeamTransactions(upperTeamId, 30),
    getTeamRecord(upperTeamId, 2024),
    getTeamSchedule(upperTeamId, 2024),
    getTeamRoster(upperTeamId),
    getTeamStatLeaders(upperTeamId, 2024)
  ])

  if (!team) {
    notFound()
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      {/* Team Header with Record */}
      <div className="mb-6">
        <TeamRecordCard record={record} team={team} />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Schedule & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <TeamScheduleCard schedule={schedule} teamId={upperTeamId} />
          <TeamStatLeadersCard leaders={statLeaders} />
        </div>

        {/* Middle Column - Roster */}
        <div className="lg:col-span-1">
          <TeamRosterCard roster={roster} teamAbbr={team.team_abbr} />
        </div>

        {/* Right Column - Transactions */}
        <div className="lg:col-span-1">
          <TransactionsCard
            transactions={transactions}
            title="Recent Transactions"
            showTeam={false}
            maxHeight="600px"
          />
        </div>
      </div>
    </main>
  )
}
