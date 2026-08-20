import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !(session.user as any)?.isAdmin) return null
  return session
}

// Mark a game winner and update all picks + user remaining_picks
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { game_id, winning_team } = await req.json()

  // Set winning team on game
  const { error: gameError } = await supabaseAdmin
    .from('games')
    .update({ winning_team })
    .eq('id', game_id)

  if (gameError) return NextResponse.json({ error: gameError.message }, { status: 500 })

  // Get all picks for this game
  const { data: gamePicks, error: picksError } = await supabaseAdmin
    .from('picks')
    .select('*')
    .eq('game_id', game_id)
    .eq('result', 'pending')

  if (picksError) return NextResponse.json({ error: picksError.message }, { status: 500 })

  for (const pick of gamePicks ?? []) {
    const won = pick.team_picked === winning_team
    const result = won ? 'won' : 'lost'

    await supabaseAdmin.from('picks').update({ result }).eq('id', pick.id)

    if (!won) {
      // Deduct lost picks from user's remaining_picks
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('remaining_picks')
        .eq('id', pick.user_id)
        .single()

      if (user) {
        const newRemaining = Math.max(0, user.remaining_picks - pick.picks_wagered)
        await supabaseAdmin
          .from('users')
          .update({ remaining_picks: newRemaining })
          .eq('id', pick.user_id)
      }
    }
  }

  return NextResponse.json({ success: true })
}

// Finalize a week — apply deadline forfeit (users who didn't submit all picks lose them)
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { week_id } = await req.json()

  // Get all games in this week
  const { data: games } = await supabaseAdmin
    .from('games')
    .select('id')
    .eq('week_id', week_id)

  const gameIds = (games ?? []).map(g => g.id)

  // Get all non-admin users
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, remaining_picks')
    .eq('is_admin', false)

  for (const user of users ?? []) {
    if (user.remaining_picks === 0) continue

    // Check how many picks this user submitted this week
    const { data: userPicks } = await supabaseAdmin
      .from('picks')
      .select('picks_wagered')
      .eq('user_id', user.id)
      .eq('week_id', week_id)

    const submitted = (userPicks ?? []).reduce((sum, p) => sum + p.picks_wagered, 0)

    if (submitted < user.remaining_picks) {
      // User didn't use all picks — forfeit all remaining picks
      await supabaseAdmin
        .from('users')
        .update({ remaining_picks: 0 })
        .eq('id', user.id)
    }
  }

  // Mark week finalized
  await supabaseAdmin.from('weeks').update({ status: 'finalized' }).eq('id', week_id)

  return NextResponse.json({ success: true })
}
