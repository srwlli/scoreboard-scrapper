'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface ToolCard {
  title: string
  description: string
  href: string
  badge?: {
    text: string
    variant: 'admin' | 'live' | 'game' | 'stats' | 'final'
  }
  external?: boolean
}

interface ToolSection {
  title: string
  icon: string
  tools: ToolCard[]
}

const BADGE_COLORS = {
  admin: 'bg-red-500/20 text-red-400',
  live: 'bg-green-500/20 text-green-400',
  game: 'bg-blue-500/20 text-blue-400',
  stats: 'bg-purple-500/20 text-purple-400',
  final: 'bg-orange-500/20 text-orange-400',
}

const SECTIONS: ToolSection[] = [
  {
    title: 'Admin & Monitoring',
    icon: '🔧',
    tools: [
      {
        title: 'Admin Dashboard',
        description: 'Data freshness, table stats, coverage map. Auto-refreshes every 30s.',
        href: '/admin',
        badge: { text: 'Admin', variant: 'admin' },
      },
      {
        title: 'Scrapers Status',
        description: 'Scheduler status, recent games, system logs, manual controls.',
        href: '/admin/scrapers',
        badge: { text: 'Admin', variant: 'admin' },
      },
      {
        title: 'Data Maps',
        description: 'Schema documentation for all tables and fields.',
        href: '/data-maps',
        badge: { text: 'Docs', variant: 'stats' },
      },
    ],
  },
  {
    title: 'Live Data Views',
    icon: '🏈',
    tools: [
      {
        title: 'Scoreboard',
        description: 'Live scores for current week games.',
        href: '/scoreboard',
        badge: { text: 'Live', variant: 'live' },
      },
      {
        title: 'Standings',
        description: 'Division and conference standings.',
        href: '/standings',
        badge: { text: 'Live', variant: 'live' },
      },
      {
        title: 'Teams',
        description: 'All 32 NFL teams with schedules.',
        href: '/teams',
        badge: { text: 'Live', variant: 'live' },
      },
      {
        title: 'Injuries',
        description: 'Current injury reports by team.',
        href: '/injuries',
        badge: { text: 'Live', variant: 'live' },
      },
    ],
  },
]

function ToolCard({ tool }: { tool: ToolCard }) {
  const CardWrapper = tool.external ? 'a' : Link
  const props = tool.external
    ? { href: tool.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tool.href }

  return (
    <CardWrapper
      {...props}
      className="block p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {tool.title}
        </h3>
        {tool.badge && (
          <Badge variant="outline" className={BADGE_COLORS[tool.badge.variant]}>
            {tool.badge.text}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{tool.description}</p>
      {tool.external && (
        <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
          External link ↗
        </p>
      )}
    </CardWrapper>
  )
}

export function DevToolsIndex() {
  const totalTools = SECTIONS.reduce((acc, s) => acc + s.tools.length, 0)

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          NFL Stats Platform
        </h1>
        <p className="text-muted-foreground">Dashboard & Tools Index</p>
      </header>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
              <span>{section.icon}</span>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="text-center mt-12 pt-6 border-t text-sm text-muted-foreground">
        <p>NFL Stats Platform &bull; Next Down Metrics</p>
        <p className="font-mono text-xs mt-1">{totalTools} tools indexed</p>
      </footer>
    </main>
  )
}
