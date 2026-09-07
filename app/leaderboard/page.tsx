'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import Navbar from '@/components/Navbar'
import type { LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const { user, status } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/leaderboard').then(r => r.json()).then(data => { setEntries(data); setLoading(false) })
  }, [status])

  if (status === 'loading' || loading) return null

  const totalPot = entries.reduce((sum, e) => sum + e.initial_picks, 0) * 10

  // Compute tie-aware ranks: same remaining_picks + total_wins = same rank
  const ranks = entries.map((entry, i) => {
    if (i === 0) return 1
    const prev = entries[i - 1]
    return (entry.remaining_picks === prev.remaining_picks && entry.total_wins === prev.total_wins)
      ? -1 // placeholder, resolved below
      : i + 1
  })
  // resolve placeholders back to the rank of the group leader
  let lastRank = 1
  const resolvedRanks = ranks.map((r, i) => {
    if (r !== -1) { lastRank = r; return r }
    return lastRank
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏆</span>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>
        <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Total Pot</div>
            <div className="text-white text-3xl font-bold">${totalPot.toLocaleString()}</div>
          </div>
          <span className="text-4xl">💰</span>
        </div>
        {entries.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">No players yet.</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const rank = resolvedRanks[i]
              const pct = Math.round((entry.remaining_picks / entry.initial_picks) * 100)
              const isMe = entry.username === user?.username
              const isEliminated = entry.remaining_picks === 0
              return (
                <div key={entry.id} className={`rounded-xl p-4 border transition ${
                  isMe ? 'bg-green-900/30 border-green-600' :
                  isEliminated ? 'bg-gray-800/50 border-gray-700 opacity-60' : 'bg-gray-800 border-gray-700'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold w-8 text-center ${
                      rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{entry.username}</span>
                        {isMe && <span className="text-xs bg-green-700 text-green-200 px-2 py-0.5 rounded-full">You</span>}
                        {isEliminated && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Eliminated</span>}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${isEliminated ? 'bg-gray-600' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isEliminated ? 'text-gray-500' : 'text-green-400'}`}>
                        {entry.remaining_picks}
                      </div>
                      <div className="text-xs text-gray-500">of {entry.initial_picks}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 ml-12 text-xs text-gray-500">
                    <span>{entry.total_wins} wins</span>
                    <span>{entry.total_losses} losses</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
