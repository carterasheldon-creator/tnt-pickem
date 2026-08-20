import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const week_id = searchParams.get('week_id')

  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('username', session.username).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let query = supabaseAdmin.from('picks').select('*').eq('user_id', user.id)
  if (week_id) query = query.eq('week_id', week_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('username', session.username).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { week_id, picks } = await req.json()

  const { data: week } = await supabaseAdmin
    .from('weeks').select('*').eq('id', week_id).single()

  if (!week || week.status !== 'open') {
    return NextResponse.json({ error: 'This week is not open for picks' }, { status: 400 })
  }

  if (new Date() > new Date(week.deadline)) {
    return NextResponse.json({ error: 'Deadline has passed for this week' }, { status: 400 })
  }

  const total = picks.reduce((sum: number, p: any) => sum + p.picks_wagered, 0)
  if (total !== user.remaining_picks) {
    return NextResponse.json(
      { error: `You must use all ${user.remaining_picks} picks` },
      { status: 400 }
    )
  }

  await supabaseAdmin.from('picks').delete().eq('user_id', user.id).eq('week_id', week_id)

  const rows = picks.map((p: any) => ({
    user_id: user.id,
    week_id,
    game_id: p.game_id,
    team_picked: p.team_picked,
    picks_wagered: p.picks_wagered,
    result: 'pending',
  }))

  const { error } = await supabaseAdmin.from('picks').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
