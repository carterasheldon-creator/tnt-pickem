'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Home() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏈</div>
          <h1 className="text-4xl font-bold text-white mb-2">TnT Weekly Pick 'Em</h1>
          <p className="text-gray-400 text-lg">
            Welcome back, <span className="text-green-400 font-semibold">{user?.username}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link href="/picks" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-green-500 rounded-2xl p-6 transition group">
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-green-400">My Picks</h2>
            <p className="text-gray-400 text-sm">Make your picks for this week before Wednesday midnight</p>
          </Link>
          <Link href="/leaderboard" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-yellow-500 rounded-2xl p-6 transition group">
            <div className="text-3xl mb-3">🏆</div>
            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400">Leaderboard</h2>
            <p className="text-gray-400 text-sm">See who has the most picks remaining this season</p>
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-yellow-400 rounded-2xl p-6 transition group md:col-span-2">
              <div className="text-3xl mb-3">⚙️</div>
              <h2 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400">Admin Panel</h2>
              <p className="text-gray-400 text-sm">Manage users, add games, and enter results</p>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
