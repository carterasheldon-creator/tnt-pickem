'use client'
import { useEffect, useState } from 'react'

type PickRow = { username: string; team_picked: string; picks_wagered: number; result: string }
type GameBreakdown = {
  game_id: string
  home_team: string
  away_team: string
  winning_team: string | null
  picks: PickRow[]
}
type WeekBreakdown = {
  week_id: string
  week_number: number
  deadline: string
  status: string
  games: GameBreakdown[]
}

function resultColor(r: string) {
  return r === 'won' ? 'text-green-400' : r === 'lost' ? 'text-red-400' : 'text-yellow-400'
}

export default function AdminAllPicks() {
  const [weeks, setWeeks] = useState<WeekBreakdown[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/all-picks')
    const data: WeekBreakdown[] = await res.json()
    setWeeks(data)
    setSelectedId(prev => prev ?? (data.length ? data[data.length - 1].week_id : null))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const selected = weeks.find(w => w.week_id === selectedId) ?? null

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {weeks.map(w => (
            <button
              key={w.week_id}
              onClick={() => setSelectedId(w.week_id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                selectedId === w.week_id ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Week {w.week_number}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg"
        >
          ↻ Refresh
        </button>
      </div>

      {weeks.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
          No weeks have been opened yet.
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
            const teams = [game.away_team, game.home_team]
            return (
              <div key={game.game_id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white text-sm font-semibold">
                    <span className="text-gray-400">{game.away_team}</span>
                    <span className="text-gray-500 mx-2">@</span>
                    <span className="text-white">{game.home_team}</span>
                  </p>
                  {game.winning_team && (
                    <span className="text-xs text-green-400">Winner: {game.winning_team}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map(team => {
                    const forTeam = game.picks.filter(p => p.team_picked === team)
                    const wagered = forTeam.reduce((s, p) => s + p.picks_wagered, 0)
                    const isWinner = game.winning_team === team
                    return (
                      <div
                        key={team}
                        className={`rounded-lg p-3 border ${
                          isWinner ? 'border-green-600 bg-green-900/20' : 'border-gray-700 bg-gray-900/40'
                        }`}
                      >
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-white font-semibold text-sm">{team}</span>
                          <span className="text-xs text-gray-400">
                            {forTeam.length} {forTeam.length === 1 ? 'player' : 'players'} · {wagered} picks
                          </span>
                        </div>
                        {forTeam.length === 0 ? (
                          <p className="text-gray-600 text-xs italic">No picks</p>
                        ) : (
                          <ul className="space-y-1">
                            {forTeam.map((p, i) => (
                              <li key={i} className="flex items-center justify-between text-xs">
                                <span className="text-gray-200">{p.username}</span>
                                <span className="text-gray-400">
                                  <span className="text-white font-medium">{p.picks_wagered}</span> picks
                                  {p.result !== 'pending' && (
                                    <span className={`ml-2 ${resultColor(p.result)}`}>{p.result}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>

                {game.picks.length === 0 && (
                  <p className="text-gray-600 text-xs mt-3 text-center">No one has picked this game yet.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
