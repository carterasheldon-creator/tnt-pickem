import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || !(session.user as any)?.isAdmin) {
    return null
  }
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, is_admin, initial_picks, remaining_picks, created_at')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { username, password, initial_picks } = await req.json()
  if (!username || !password || !initial_picks) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ username, password_hash, initial_picks, remaining_picks: initial_picks })
    .select('id, username, initial_picks, remaining_picks')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
