'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import Navbar from '@/components/Navbar'

type TeamAgg = { team: string; players: number; picks_wagered: number }
type GameAgg = {
  game_id: string
  home_team: string
  away_team: string
  winning_team: string | null
  total_players: number
  total_wagered: number
  teams: TeamAgg[]
}
type WeekAgg = {
  week_id: string
  week_number: number
  deadline: string
  status: string
  games: GameAgg[]
}

export default function TrendsPage() {
  const { status } = useAuth()
  const router = useRouter()
  const [weeks, setWeeks] = useState<WeekAgg[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  async function load() {
    const res = await fetch('/api/pick-distribution')
    const data: WeekAgg[] = await res.json()
    setWeeks(data)
    setSelectedId(prev => prev ?? (data.length ? data[data.length - 1].week_id : null))
    setLoading(false)
  }

  useEffect(() => {
    if (status !== 'authenticated') return
    load()
  }, [status])

  if (status === 'loading' || loading) return null

  const selected = weeks.find(w => w.week_id === selectedId) ?? null

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h1 className="text-2xl font-bold text-white">Pick Trends</h1>
          </div>
          <button
            onClick={load}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg"
          >
            ↻ Refresh
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Total picks placed on each team — updates live as picks come in. No individual picks shown.
        </p>

        {weeks.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
            No weeks have been opened yet.
          </div>
        )}

        {weeks.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {weeks.map(w => (
              <button
                key={w.week_id}
                onClick={() => setSelectedId(w.week_id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedId === w.week_id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Week {w.week_number}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="space-y-4">
            {selected.games.length === 0 && (
              <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
                No games in this week yet.
              </div>
            )}

            {selected.games.map(game => {
              const total = game.total_wagered
              return (
                <div key={game.game_id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-semibold">
                      <span className="text-gray-400">{game.away_team}</span>
                      <span className="text-gray-500 mx-2">@</span>
                      <span className="text-white">{game.home_team}</span>
                    </p>
                    <span className="text-xs text-gray-500">
                      {game.total_wagered} picks · {game.total_players} players
                    </span>
                  </div>

                  {total === 0 ? (
                    <p className="text-gray-600 text-xs italic">No picks yet</p>
                  ) : (
                    <>
                      <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                        {game.teams.map((t, i) => {
                          const pct = total > 0 ? (t.picks_wagered / total) * 100 : 0
                          if (pct === 0) return null
                          return (
                            <div
                              key={t.team}
                              className={`flex items-center justify-center text-xs font-semibold ${
                                i === 0 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}
                              style={{ width: `${pct}%` }}
                            >
                              {pct >= 12 ? `${Math.round(pct)}%` : ''}
                            </div>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {game.teams.map((t, i) => (
                          <div key={t.team} className="text-xs">
                            <span className={i === 0 ? 'text-green-400' : 'text-blue-400'}>●</span>{' '}
                            <span className="text-gray-200 font-medium">{t.team}</span>
                            <span className="text-gray-500">
                              {' '}— {t.picks_wagered} picks · {t.players} {t.players === 1 ? 'player' : 'players'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
