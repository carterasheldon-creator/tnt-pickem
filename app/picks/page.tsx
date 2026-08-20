'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import type { Week, Game, Pick } from '@/lib/types'

type WeekWithGames = Week & { games: Game[] }

export default function PicksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [weeks, setWeeks] = useState<WeekWithGames[]>([])
  const [selectedWeek, setSelectedWeek] = useState<WeekWithGames | null>(null)
  const [userPicks, setUserPicks] = useState<Record<string, { team: string; amount: number }>>({})
  const [existingPicks, setExistingPicks] = useState<Pick[]>([])
  const [remainingPicks, setRemainingPicks] = useState(0)
  const [allocated, setAllocated] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetchData()
  }, [session])

  async function fetchData() {
    const [weeksRes, userRes] = await Promise.all([
      fetch('/api/admin/weeks'),
      fetch('/api/me'),
    ])
    const weeksData: WeekWithGames[] = await weeksRes.json()
    const me = await userRes.json()
    setUserData(me)
    setRemainingPicks(me?.remaining_picks ?? 0)

    const openWeeks = weeksData.filter(w => w.status === 'open' || w.status === 'closed' || w.status === 'finalized')
    setWeeks(openWeeks)
    const current = openWeeks.find(w => w.status === 'open') ?? openWeeks[openWeeks.length - 1]
    if (current) {
      setSelectedWeek(current)
      loadPicksForWeek(current.id, me?.remaining_picks ?? 0)
    }
  }

  async function loadPicksForWeek(week_id: string, picks: number) {
    const res = await fetch(`/api/picks?week_id=${week_id}`)
    const data: Pick[] = await res.json()
    setExistingPicks(data)
    const init: Record<string, { team: string; amount: number }> = {}
    for (const p of data) {
      init[p.game_id] = { team: p.team_picked, amount: p.picks_wagered }
    }
    setUserPicks(init)
    const total = data.reduce((s, p) => s + p.picks_wagered, 0)
    setAllocated(total)
  }

  function setPickTeam(gameId: string, team: string) {
    setUserPicks(prev => ({
      ...prev,
      [gameId]: { team, amount: prev[gameId]?.amount ?? 0 },
    }))
  }

  function setPickAmount(gameId: string, amount: number) {
    const prev = userPicks[gameId]
    if (!prev?.team) return
    const other = Object.entries(userPicks)
      .filter(([id]) => id !== gameId)
      .reduce((s, [, v]) => s + (v.amount ?? 0), 0)
    const max = remainingPicks - other
    const clamped = Math.min(Math.max(0, amount), max)
    const updated = { ...userPicks, [gameId]: { ...prev, amount: clamped } }
    setUserPicks(updated)
    setAllocated(Object.values(updated).reduce((s, v) => s + (v.amount ?? 0), 0))
  }

  async function handleSubmit() {
    if (!selectedWeek) return
    if (allocated !== remainingPicks) {
      setMessage(`You must allocate all ${remainingPicks} picks before submitting.`)
      return
    }
    setSaving(true)
    setMessage('')
    const picks = Object.entries(userPicks)
      .filter(([, v]) => v.team && v.amount > 0)
      .map(([game_id, v]) => ({
        game_id,
        team_picked: v.team,
        picks_wagered: v.amount,
      }))

    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_id: selectedWeek.id, picks }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setMessage('Picks saved!')
      loadPicksForWeek(selectedWeek.id, remainingPicks)
    } else {
      setMessage(data.error ?? 'Error saving picks')
    }
  }

  const deadlinePassed = selectedWeek ? new Date() > new Date(selectedWeek.deadline) : false
  const canPick = selectedWeek?.status === 'open' && !deadlinePassed && remainingPicks > 0

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">My Picks</h1>
          <div className="bg-gray-800 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-green-400">{remainingPicks}</div>
            <div className="text-xs text-gray-400">picks remaining</div>
          </div>
        </div>

        {weeks.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
            No weeks have been opened yet. Check back soon!
          </div>
        )}

        {weeks.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {weeks.map(w => (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedWeek(w)
                  loadPicksForWeek(w.id, remainingPicks)
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedWeek?.id === w.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Week {w.week_number}
                {w.status === 'finalized' && ' ✓'}
              </button>
            ))}
          </div>
        )}

        {selectedWeek && (
          <>
            <div className="bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-sm">Deadline: </span>
                <span className="text-white text-sm font-medium">
                  {new Date(selectedWeek.deadline).toLocaleString('en-US', {
                    weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                selectedWeek.status === 'open' ? 'bg-green-900 text-green-300' :
                selectedWeek.status === 'finalized' ? 'bg-blue-900 text-blue-300' :
                'bg-red-900 text-red-300'
              }`}>
                {selectedWeek.status}
              </span>
            </div>

            {canPick && (
              <div className="bg-gray-800 rounded-xl p-3 mb-4 flex items-center gap-3">
                <div className="flex-1 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${(allocated / remainingPicks) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-300 whitespace-nowrap">
                  {allocated} / {remainingPicks} allocated
                </span>
              </div>
            )}

            <div className="space-y-4">
              {selectedWeek.games.map(game => {
                const pick = userPicks[game.id]
                const existing = existingPicks.find(p => p.game_id === game.id)
                const isFinalized = selectedWeek.status === 'finalized'
                const winner = game.winning_team

                return (
                  <div key={game.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex gap-3 mb-3">
                      {[game.away_team, game.home_team].map(team => {
                        const isWinner = isFinalized && winner === team
                        const isLoser = isFinalized && winner && winner !== team
                        const isSelected = pick?.team === team
                        return (
                          <button
                            key={team}
                            onClick={() => canPick && setPickTeam(game.id, team)}
                            disabled={!canPick}
                            className={`flex-1 py-3 rounded-lg font-semibold text-sm transition border-2 ${
                              isWinner ? 'bg-green-800 border-green-500 text-green-200' :
                              isLoser ? 'bg-gray-750 border-gray-600 text-gray-500 line-through' :
                              isSelected ? 'bg-green-700 border-green-500 text-white' :
                              canPick ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-400' :
                              'bg-gray-700 border-gray-700 text-gray-400 cursor-default'
                            }`}
                          >
                            {team}
                            {isWinner && ' 🏆'}
                          </button>
                        )
                      })}
                    </div>

                    {canPick && pick?.team && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gray-400 text-sm w-28">Picks on {pick.team}:</span>
                        <button
                          onClick={() => setPickAmount(game.id, (pick.amount ?? 0) - 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
                        >
                          -
                        </button>
                        <span className="text-white font-bold w-6 text-center">{pick.amount ?? 0}</span>
                        <button
                          onClick={() => setPickAmount(game.id, (pick.amount ?? 0) + 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {!canPick && existing && (
                      <div className="mt-2 text-sm text-gray-400">
                        {existing.picks_wagered} picks on <span className="text-white font-medium">{existing.team_picked}</span>
                        {' — '}
                        <span className={
                          existing.result === 'won' ? 'text-green-400' :
                          existing.result === 'lost' ? 'text-red-400' :
                          'text-yellow-400'
                        }>
                          {existing.result}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {canPick && (
              <div className="mt-6">
                {message && (
                  <p className={`text-sm mb-3 ${message === 'Picks saved!' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={saving || allocated !== remainingPicks}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
                >
                  {saving ? 'Saving...' : `Submit ${remainingPicks} Picks`}
                </button>
                <p className="text-center text-gray-500 text-xs mt-2">
                  You can re-submit before the deadline if you change your mind
                </p>
              </div>
            )}

            {remainingPicks === 0 && (
              <div className="mt-6 bg-red-900/30 border border-red-700 rounded-xl p-4 text-center text-red-300">
                You have no picks remaining this season.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
