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

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { week_id } = await req.json()

  // Get all games in this week
  const { data: games, error: gamesError } = await supabaseAdmin
    .from('games')
    .select('id')
    .eq('week_id', week_id)

  if (gamesError) return NextResponse.json({ error: gamesError.message }, { status: 500 })

  const gameIds = (games ?? []).map(g => g.id)

  if (gameIds.length > 0) {
    // Find all lost picks so we can restore remaining_picks
    const { data: lostPicks } = await supabaseAdmin
      .from('picks')
      .select('user_id, picks_wagered')
      .in('game_id', gameIds)
      .eq('result', 'lost')

    // Restore remaining_picks for each user who had lost picks
    const restoreMap: Record<string, number> = {}
    for (const pick of lostPicks ?? []) {
      restoreMap[pick.user_id] = (restoreMap[pick.user_id] ?? 0) + pick.picks_wagered
    }
    for (const [userId, amount] of Object.entries(restoreMap)) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('remaining_picks, initial_picks')
        .eq('id', userId)
        .single()
      if (user) {
        await supabaseAdmin
          .from('users')
          .update({ remaining_picks: Math.min(user.initial_picks, user.remaining_picks + amount) })
          .eq('id', userId)
      }
    }

    // Reset all picks in this week back to pending
    await supabaseAdmin
      .from('picks')
      .update({ result: 'pending' })
      .in('game_id', gameIds)

    // Clear winning_team on all games in this week
    await supabaseAdmin
      .from('games')
      .update({ winning_team: null })
      .eq('week_id', week_id)
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
