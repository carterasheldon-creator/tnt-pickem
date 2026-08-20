import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { week_id, home_team, away_team } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('games')
    .insert({ week_id, home_team, away_team })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('games').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
