import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

// Admin-only: full breakdown of every pick for every opened week —
// who picked what, in which game, and how many picks they wagered.
export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: weeks, error: weeksError } = await supabaseAdmin
    .from('weeks')
    .select('id, week_number, deadline, status, games(id, home_team, away_team, winning_team)')
    .neq('status', 'upcoming')
    .order('week_number', { ascending: true })
  if (weeksError) return NextResponse.json({ error: weeksError.message }, { status: 500 })

  const { data: picks, error: picksError } = await supabaseAdmin
    .from('picks')
    .select('week_id, game_id, team_picked, picks_wagered, result, users(username)')
  if (picksError) return NextResponse.json({ error: picksError.message }, { status: 500 })

  type PickJoin = {
    week_id: string
    game_id: string
    team_picked: string
    picks_wagered: number
    result: string
    users: { username: string } | { username: string }[] | null
  }

  const rows = (picks ?? []) as PickJoin[]

  const result = (weeks ?? []).map(week => ({
    week_id: week.id,
    week_number: week.week_number,
    deadline: week.deadline,
    status: week.status,
    games: (week.games ?? []).map(game => ({
      game_id: game.id,
      home_team: game.home_team,
      away_team: game.away_team,
      winning_team: game.winning_team,
      picks: rows
        .filter(p => p.game_id === game.id)
        .map(p => ({
          username: Array.isArray(p.users) ? p.users[0]?.username ?? 'unknown' : p.users?.username ?? 'unknown',
          team_picked: p.team_picked,
          picks_wagered: p.picks_wagered,
          result: p.result,
        }))
        .sort((a, b) => b.picks_wagered - a.picks_wagered || a.username.localeCompare(b.username)),
    })),
  }))

  return NextResponse.json(result)
}
