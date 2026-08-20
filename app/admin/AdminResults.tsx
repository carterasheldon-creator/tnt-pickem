'use client'
import { useEffect, useState } from 'react'
import type { Week, Game } from '@/lib/types'

type WeekWithGames = Week & { games: Game[] }

export default function AdminResults() {
  const [weeks, setWeeks] = useState<WeekWithGames[]>([])
  const [selectedWeek, setSelectedWeek] = useState<WeekWithGames | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchWeeks() }, [])

  async function fetchWeeks() {
    const res = await fetch('/api/admin/weeks')
    const data: WeekWithGames[] = await res.json()
    const relevant = data.filter(w => w.status === 'open' || w.status === 'closed' || w.status === 'finalized')
    setWeeks(relevant)
    if (relevant.length > 0 && !selectedWeek) {
      setSelectedWeek(relevant[relevant.length - 1])
    }
  }

  async function markWinner(game_id: string, winning_team: string) {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id, winning_team }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setMessage('Result saved! Picks updated.')
      fetchWeeks()
    } else {
      setMessage(data.error ?? 'Error')
    }
  }

  async function finalizeWeek() {
    if (!selectedWeek) return
    if (!confirm('Finalize this week? Users who did not submit all picks will lose them. This cannot be undone.')) return
    setSaving(true)
    const res = await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_id: selectedWeek.id }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setMessage('Week finalized!')
      fetchWeeks()
    }
  }

  const allGamesDecided = selectedWeek?.games.every(g => g.winning_team) && (selectedWeek?.games.length ?? 0) > 0

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-2">
        {weeks.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWeek(w)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selectedWeek?.id === w.id ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Week {w.week_number}
          </button>
        ))}
      </div>

      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}

      {selectedWeek && (
        <div className="space-y-3">
          {selectedWeek.games.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
              No games in this week yet
            </div>
          )}
          {selectedWeek.games.map(game => (
            <div key={game.id} className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-3">
                {game.away_team} @ {game.home_team}
              </p>
              {game.winning_team ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-semibold">Winner: {game.winning_team}</span>
                  <span className="text-gray-500 text-xs">(result locked)</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => markWinner(game.id, game.away_team)}
                    disabled={saving}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
                  >
                    {game.away_team} Won
                  </button>
                  <button
                    onClick={() => markWinner(game.id, game.home_team)}
                    disabled={saving}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
                  >
                    {game.home_team} Won
                  </button>
                </div>
              )}
            </div>
          ))}

          {allGamesDecided && selectedWeek.status !== 'finalized' && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
              <p className="text-yellow-300 text-sm mb-3">
                All games have results. Finalize the week to apply deadline forfeits and lock the week.
              </p>
              <button
                onClick={finalizeWeek}
                disabled={saving}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {saving ? 'Finalizing...' : 'Finalize Week ' + selectedWeek.week_number}
              </button>
            </div>
          )}

          {selectedWeek.status === 'finalized' && (
            <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 text-green-300 text-sm text-center">
              Week {selectedWeek.week_number} is finalized.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
