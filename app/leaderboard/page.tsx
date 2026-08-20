'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import type { LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
  }, [session])

  if (status === 'loading' || loading) return null

  const myName = session?.user?.name

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🏆</span>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        </div>

        {entries.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
            No players yet.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const pct = Math.round((entry.remaining_picks / entry.initial_picks) * 100)
              const isMe = entry.username === myName
              const isEliminated = entry.remaining_picks === 0

              return (
                <div
                  key={entry.id}
                  className={`rounded-xl p-4 border transition ${
                    isMe
                      ? 'bg-green-900/30 border-green-600'
                      : isEliminated
                      ? 'bg-gray-800/50 border-gray-700 opacity-60'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold w-8 text-center ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300' :
                      i === 2 ? 'text-amber-600' :
                      'text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{entry.username}</span>
                        {isMe && <span className="text-xs bg-green-700 text-green-200 px-2 py-0.5 rounded-full">You</span>}
                        {isEliminated && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Eliminated</span>}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isEliminated ? 'bg-gray-600' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
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
