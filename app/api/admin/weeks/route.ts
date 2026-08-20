import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || !(session.user as any)?.isAdmin) return null
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
  const { id, status } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('weeks')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
