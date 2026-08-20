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

  const { game_id, winning_team } = await req.json()

  const { error: gameError } = await supabaseAdmin
    .from('games')
    .update({ winning_team })
    .eq('id', game_id)

  if (gameError) return NextResponse.json({ error: gameError.message }, { status: 500 })

  const { data: gamePicks, error: picksError } = await supabaseAdmin
    .from('picks')
    .select('*')
    .eq('game_id', game_id)
    .eq('result', 'pending')

  if (picksError) return NextResponse.json({ error: picksError.message }, { status: 500 })

  for (const pick of gamePicks ?? []) {
    const won = pick.team_picked === winning_team
    await supabaseAdmin.from('picks').update({ result: won ? 'won' : 'lost' }).eq('id', pick.id)

    if (!won) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('remaining_picks')
        .eq('id', pick.user_id)
        .single()

      if (user) {
        await supabaseAdmin
          .from('users')
          .update({ remaining_picks: Math.max(0, user.remaining_picks - pick.picks_wagered) })
          .eq('id', pick.user_id)
      }
    }
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { week_id } = await req.json()

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, remaining_picks')
    .eq('is_admin', false)

  for (const user of users ?? []) {
    if (user.remaining_picks === 0) continue
    const { data: userPicks } = await supabaseAdmin
      .from('picks')
      .select('picks_wagered')
      .eq('user_id', user.id)
      .eq('week_id', week_id)

    const submitted = (userPicks ?? []).reduce((sum, p) => sum + p.picks_wagered, 0)
    if (submitted < user.remaining_picks) {
      await supabaseAdmin.from('users').update({ remaining_picks: 0 }).eq('id', user.id)
    }
  }

  await supabaseAdmin.from('weeks').update({ status: 'finalized' }).eq('id', week_id)
  return NextResponse.json({ success: true })
}
