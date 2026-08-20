'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/lib/types'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [picks, setPicks] = useState(10)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.filter((u: User) => !u.is_admin))
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, initial_picks: picks }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.id) {
      setMessage(`User "${username}" created!`)
      setUsername('')
      setPassword('')
      setPicks(10)
      fetchUsers()
    } else {
      setMessage(data.error ?? 'Error creating user')
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This will remove all their picks.`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add New Player</h2>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
            required
          />
          <input
            placeholder="Password"
            type="text"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
            required
          />
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm whitespace-nowrap">Picks:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={picks}
              onChange={e => setPicks(Number(e.target.value))}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-500 w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
          >
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.includes('Error') || message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-center">Starting Picks</th>
              <th className="px-4 py-3 text-center">Remaining Picks</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No players yet</td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-white font-medium">{user.username}</td>
                <td className="px-4 py-3 text-center text-gray-300">{user.initial_picks}</td>
                <td className="px-4 py-3 text-center">
                  <span className={user.remaining_picks === 0 ? 'text-red-400' : 'text-green-400'}>
                    {user.remaining_picks}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {user.remaining_picks === 0 ? (
                    <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">Eliminated</span>
                  ) : (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteUser(user.id, user.username)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
