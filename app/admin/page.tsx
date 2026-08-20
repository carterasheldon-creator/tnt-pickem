'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import AdminUsers from './AdminUsers'
import AdminWeeks from './AdminWeeks'
import AdminResults from './AdminResults'

type Tab = 'users' | 'weeks' | 'results'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('users')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session && !(session.user as any)?.isAdmin) router.push('/')
  }, [status, session, router])

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">⚙️</span>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
          {(['users', 'weeks', 'results'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                tab === t ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t === 'users' ? '👥 Users' : t === 'weeks' ? '📅 Weeks & Games' : '🏆 Results'}
            </button>
          ))}
        </div>

        {tab === 'users' && <AdminUsers />}
        {tab === 'weeks' && <AdminWeeks />}
        {tab === 'results' && <AdminResults />}
      </main>
    </div>
  )
}
