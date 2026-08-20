import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await createSession({
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin,
  })

  const res = NextResponse.json({ ok: true, isAdmin: user.is_admin })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
