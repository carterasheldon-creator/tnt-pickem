'use client'
import { useState, useEffect } from 'react'
import type { SessionUser } from './session'

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data && data.username) {
          setUser(data)
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
        }
      })
      .catch(() => setStatus('unauthenticated'))
  }, [])

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return { user, status, signOut }
}
