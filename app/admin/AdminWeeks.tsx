'use client'
import { useEffect, useState } from 'react'
import type { Week, Game } from '@/lib/types'
import { arizonaLocalToUtcIso, utcIsoToArizonaLocal, formatDeadlineArizona } from '@/lib/time'

type WeekWithGames = Week & { games: Game[] }

export default function AdminWeeks() {
  const [weeks, setWeeks] = useState<WeekWithGames[]>([])
  const [selectedWeek, setSelectedWeek] = useState<WeekWithGames | null>(null)
  const [weekNum, setWeekNum] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deadlineEdit, setDeadlineEdit] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { fetchWeeks() }, [])

  // Keep the editable deadline (Arizona wall-clock) in sync with the selected week.
  useEffect(() => {
    setDeadlineEdit(selectedWeek ? utcIsoToArizonaLocal(selectedWeek.deadline) : '')
  }, [selectedWeek?.id, selectedWeek?.deadline])

  async function fetchWeeks() {
    const res = await fetch('/api/admin/weeks')
    const data: WeekWithGames[] = await res.json()
    setWeeks(data)
    setSelectedWeek(prev => {
      if (!prev) return data.length > 0 ? data[data.length - 1] : null
      // Keep the detail pane in sync with freshly fetched data (status, deadline).
      return data.find(w => w.id === prev.id) ?? prev
    })
  }

  async function createWeek(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/weeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_number: Number(weekNum), deadline: arizonaLocalToUtcIso(deadline) }),
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

  async function patchWeek(id: string, body: { status?: string; deadline?: string }) {
    const res = await fetch('/api/admin/weeks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    })
    const data = await res.json()
    await fetchWeeks()
    return data
  }

  async function setWeekStatus(id: string, status: string) {
    await patchWeek(id, { status })
  }

  // Open (or re-open) a week for picks using the deadline the admin entered.
  // The datetime-local value is Arizona wall-clock time; convert it to a UTC instant.
  async function openWeek(id: string) {
    if (!deadlineEdit) {
      setMessage('Set a pick deadline before opening the week.')
      return
    }
    const data = await patchWeek(id, { status: 'open', deadline: arizonaLocalToUtcIso(deadlineEdit) })
    setMessage(data?.error ?? 'Week opened for picks.')
  }

  async function saveDeadline(id: string) {
    if (!deadlineEdit) {
      setMessage('Enter a pick deadline first.')
      return
    }
    const data = await patchWeek(id, { deadline: arizonaLocalToUtcIso(deadlineEdit) })
    setMessage(data?.error ?? 'Deadline updated.')
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Week {selectedWeek.week_number} Games</h2>
              <div className="flex gap-2">
                {selectedWeek.status === 'open' && (
                  <button onClick={() => setWeekStatus(selectedWeek.id, 'closed')}
                    className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                    Close Picks
                  </button>
                )}
                <button onClick={() => resetWeek(selectedWeek.id)}
                  className="text-xs bg-orange-700 hover:bg-orange-600 text-white px-3 py-1 rounded-lg">
                  Reset Week
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4">
              <label className="text-gray-400 text-xs mb-1 block">
                Pick Deadline <span className="text-gray-500">(Arizona time — America/Phoenix)</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={deadlineEdit}
                  onChange={e => setDeadlineEdit(e.target.value)}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                />
                {/* Save the deadline on its own for any week, whatever its status. */}
                <button onClick={() => saveDeadline(selectedWeek.id)}
                  className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold">
                  {selectedWeek.status === 'open' ? 'Update Deadline' : 'Save Deadline'}
                </button>
                {(selectedWeek.status === 'upcoming' || selectedWeek.status === 'closed') && (
                  <button onClick={() => openWeek(selectedWeek.id)}
                    className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold">
                    {selectedWeek.status === 'closed' ? 'Re-open with this Deadline' : 'Open with this Deadline'}
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Currently locks at {formatDeadlineArizona(selectedWeek.deadline)} Arizona time
                &nbsp;·&nbsp; Status: <span className="text-white">{selectedWeek.status}</span>
              </p>
            </div>

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
