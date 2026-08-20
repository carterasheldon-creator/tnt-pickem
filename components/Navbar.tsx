'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = (session?.user as any)?.isAdmin

  if (!session) return null

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold text-lg flex items-center gap-2">
            🏈 TnT Pick 'Em
          </Link>
          <Link
            href="/picks"
            className={`text-sm ${pathname === '/picks' ? 'text-green-400' : 'text-gray-300 hover:text-white'}`}
          >
            My Picks
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm ${pathname === '/leaderboard' ? 'text-green-400' : 'text-gray-300 hover:text-white'}`}
          >
            Leaderboard
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm ${pathname.startsWith('/admin') ? 'text-yellow-400' : 'text-gray-300 hover:text-white'}`}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{session.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
