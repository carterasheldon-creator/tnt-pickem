import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, is_admin, initial_picks, remaining_picks')
    .eq('username', session.username)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
