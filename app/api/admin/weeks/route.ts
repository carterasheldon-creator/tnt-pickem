import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('weeks')
    .select('*, games(*)')
    .order('week_number', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // `deadline` arrives as a UTC ISO timestamp (converted from Arizona time client-side).
  const { week_number, deadline } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('weeks')
    .insert({ week_number, deadline, status: 'open' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // `deadline`, when present, is a UTC ISO timestamp (converted from Arizona time client-side).
  const { id, status, deadline } = await req.json()
  const update: { status?: string; deadline?: string } = {}
  if (status !== undefined) update.status = status
  if (deadline !== undefined) update.deadline = deadline
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('weeks')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
