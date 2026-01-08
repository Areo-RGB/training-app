import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { BarChart3, Trophy, Medal, ChevronUp, ChevronDown } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number | string
}

// Raw data from the reference
const rawData = {
  yoyoIr1: [
    { name: 'Erik', score: 1360 },
    { name: 'Finley', score: 1120 },
    { name: 'Arvid', score: 1120 },
    { name: 'Eray', score: 1000 },
    { name: 'Levi', score: 1000 },
    { name: 'Jakob', score: 920 },
    { name: 'Finn', score: 880 },
    { name: 'Lionel', score: 880 },
    { name: 'Bent', score: 800 },
    { name: 'Lion', score: 760 },
    { name: 'Lasse', score: 600 },
    { name: 'Berat', score: 560 },
    { name: 'Silas', score: 480 },
    { name: 'Metin', score: 400 },
    { name: 'Paul', score: 400 },
  ],
  springseil: [
    { name: 'Erik', score: 100 },
    { name: 'Bent', score: 100 },
    { name: 'Finley', score: 74 },
    { name: 'Eray', score: 54 },
    { name: 'Berat', score: 54 },
    { name: 'Metin', score: 53 },
    { name: 'Lion', score: '-' },
    { name: 'Silas', score: '-' },
    { name: 'Arvid', score: '-' },
    { name: 'Jakob', score: '-' },
    { name: 'Paul', score: '-' },
    { name: 'Lennox', score: '-' },
    { name: 'Levi', score: '-' },
  ],
  prellwand: [
    { name: 'Erik', score: 45 },
    { name: 'Bent', score: 41 },
    { name: 'Lion', score: 40 },
    { name: 'Berat', score: 39 },
    { name: 'Finley', score: 32 },
    { name: 'Metin', score: 31 },
    { name: 'Eray', score: 30 },
    { name: 'Silas', score: '-' },
    { name: 'Arvid', score: '-' },
    { name: 'Jakob', score: '-' },
    { name: 'Lennox', score: '-' },
    { name: 'Levi', score: '-' },
    { name: 'Paul', score: '-' },
  ],
  jonglieren: [
    { name: 'Erik', score: 100 },
    { name: 'Bent', score: 100 },
    { name: 'Lion', score: 100 },
    { name: 'Silas', score: 52 },
    { name: 'Eray', score: 47 },
    { name: 'Metin', score: 39 },
    { name: 'Finn', score: '10<' },
    { name: 'Berat', score: 32 },
    { name: 'Finley', score: 31 },
    { name: 'Arvid', score: 28 },
    { name: 'Levi', score: 12 },
    { name: 'Paul', score: '10<' },
    { name: 'Lennox', score: '10<' },
    { name: 'Lasse', score: '10<' },
  ],
}

// Helper to add ranks
const addRanks = (data: { name: string; score: number | string }[]): LeaderboardEntry[] =>
  data.map((entry, i) => ({ rank: i + 1, ...entry }))

const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: 'rank',
    header: '#',
    cell: ({ row }) => {
      const rank = row.getValue('rank') as number
      if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />
      if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />
      if (rank === 3) return <Medal className="w-4 h-4 text-orange-600" />
      return <span className="text-text-muted">{rank}</span>
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium text-text-primary">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'score',
    header: 'Punkte',
    cell: ({ row }) => {
      const score = row.getValue('score') as number | string
      if (score === '-') return <span className="text-text-muted">—</span>
      return <span className="font-mono tabular-nums">{score}</span>
    },
  },
]

interface LeaderboardCardProps {
  title: string
  subtitle?: string
  data: LeaderboardEntry[]
  gradient: string
}

function LeaderboardCard({ title, subtitle, data, gradient }: LeaderboardCardProps) {
  const [expanded, setExpanded] = useState(false)
  const displayData = expanded ? data : data.slice(0, 3)
  const hasMore = data.length > 3

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-text-muted" />
          {title}
        </CardTitle>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <DataTable columns={columns} data={displayData} />
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Alle {data.length} anzeigen
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

export default function Statistiken() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Statistiken</h1>
        <p className="text-text-secondary mt-1">
          Leistungsübersicht und Ranglisten
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeaderboardCard
          title="YoYo IR1"
          subtitle="Ausdauertest"
          data={addRanks(rawData.yoyoIr1)}
          gradient="from-blue-500 to-indigo-600"
        />
        <LeaderboardCard
          title="Springseil 100/30s"
          subtitle="Sprünge in 30 Sekunden"
          data={addRanks(rawData.springseil)}
          gradient="from-emerald-500 to-green-600"
        />
        <LeaderboardCard
          title="Prellwand 45/45s"
          subtitle="Treffer in 45 Sekunden"
          data={addRanks(rawData.prellwand)}
          gradient="from-orange-500 to-amber-600"
        />
        <LeaderboardCard
          title="Jonglieren 100x"
          subtitle="Fänge (max. 100)"
          data={addRanks(rawData.jonglieren)}
          gradient="from-purple-500 to-violet-600"
        />
      </div>
    </div>
  )
}
