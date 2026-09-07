'use client'
import { useEffect, useState } from 'react'
import type { Week, Game } from '@/lib/types'

type WeekWithGames = Week & { games: Game[] }

export default function AdminWeeks() {
  const [weeks, setWeeks] = useState<WeekWithGames[]>([])
  const [selectedWeek, setSelectedWeek] = useState<WeekWithGames | null>(null)
  const [weekNum, setWeekNum] = useState('')
  const [deadline, setDeadline] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { fetchWeeks() }, [])

  async function fetchWeeks() {
    const res = await fetch('/api/admin/weeks')
    const data: WeekWithGames[] = await res.json()
    setWeeks(data)
    if (data.length > 0 && !selectedWeek) {
      setSelectedWeek(data[data.length - 1])
    }
  }

  async function createWeek(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/weeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_number: Number(weekNum), deadline }),
    })
    const data = await res.json()
    if (data.id) {
      setWeekNum('')
      setDeadline('')
      setMessage('Week created!')
      await fetchWeeks()
      setSelectedWeek({ ...data, games: [] })
    } else {
      setMessage(data.error ?? 'Error')
    }
  }

  async function addGame(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWeek) return
    const res = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_id: selectedWeek.id, home_team: homeTeam, away_team: awayTeam }),
    })
    const data = await res.json()
    if (data.id) {
      setHomeTeam('')
      setAwayTeam('')
      await fetchWeeks()
      setSelectedWeek(prev => prev ? { ...prev, games: [...prev.games, data] } : prev)
    }
  }

  async function setWeekStatus(id: string, status: string) {
    await fetch('/api/admin/weeks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchWeeks()
  }

  async function resetWeek(id: string) {
    if (!confirm('Reset all game results for this week? This will clear winners, reset all picks to pending, and restore lost pick points.')) return
    await fetch('/api/admin/results', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_id: id }),
    })
    setMessage('Week results reset.')
    fetchWeeks()
  }

  async function deleteGame(id: string) {
    await fetch('/api/admin/games', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchWeeks()
    setSelectedWeek(prev => prev ? { ...prev, games: prev.games.filter(g => g.id !== id) } : prev)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-base font-bold text-white mb-3">Create Week</h2>
          <form onSubmit={createWeek} className="space-y-3">
            <input
              placeholder="Week number (e.g. 1)"
              type="number"
              min={1}
              value={weekNum}
              onChange={e => setWeekNum(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
              required
            />
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Pick Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg text-sm">
              Create Week
            </button>
          </form>
          {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-base font-bold text-white mb-3">Weeks</h2>
          <div className="space-y-2">
            {weeks.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWeek(w)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  selectedWeek?.id === w.id ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Week {w.week_number}
                <span className={`float-right text-xs px-1.5 py-0.5 rounded-full ${
                  w.status === 'open' ? 'bg-green-700 text-green-200' :
                  w.status === 'finalized' ? 'bg-blue-700 text-blue-200' :
                  'text-gray-500'
                }`}>{w.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedWeek ? (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-white">Week {selectedWeek.week_number} Games</h2>
              <div className="flex gap-2">
                {selectedWeek.status === 'upcoming' && (
                  <button onClick={() => setWeekStatus(selectedWeek.id, 'open')}
                    className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                    Open for Picks
                  </button>
                )}
                {selectedWeek.status === 'open' && (
                  <button onClick={() => setWeekStatus(selectedWeek.id, 'closed')}
                    className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                    Close Picks
                  </button>
                )}
                {selectedWeek.status === 'closed' && (
                  <button onClick={() => setWeekStatus(selectedWeek.id, 'open')}
                    className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                    Re-open Picks
                  </button>
                )}
                <button onClick={() => resetWeek(selectedWeek.id)}
                  className="text-xs bg-orange-700 hover:bg-orange-600 text-white px-3 py-1 rounded-lg">
                  Reset Week
                </button>
              </div>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              Deadline: {new Date(selectedWeek.deadline).toLocaleString()} &nbsp;·&nbsp; Status: <span className="text-white">{selectedWeek.status}</span>
            </p>

            <form onSubmit={addGame} className="flex gap-2 mb-4">
              <input
                placeholder="Away team"
                value={awayTeam}
                onChange={e => setAwayTeam(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                required
              />
              <span className="text-gray-400 self-center text-sm">@</span>
              <input
                placeholder="Home team"
                value={homeTeam}
                onChange={e => setHomeTeam(e.target.value)}
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                required
              />
              <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                Add
              </button>
            </form>

            <div className="space-y-2">
              {selectedWeek.games.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No games added yet</p>
              )}
              {selectedWeek.games.map(game => (
                <div key={game.id} className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                  <span className="text-sm text-white">
                    <span className="text-gray-400">{game.away_team}</span>
                    <span className="text-gray-500 mx-2">@</span>
                    <span className="text-white">{game.home_team}</span>
                  </span>
                  {game.winning_team ? (
                    <span className="text-xs text-green-400">Winner: {game.winning_team}</span>
                  ) : (
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
            Select or create a week
          </div>
        )}
      </div>
    </div>
  )
}
