import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

// Any signed-in user: aggregate pick distribution per game/team for every
// opened week. Totals only — no usernames, not filtered by player. Updates
// live as picks come in.
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: weeks, error: weeksError } = await supabaseAdmin
    .from('weeks')
    .select('id, week_number, deadline, status, games(id, home_team, away_team, winning_team)')
    .neq('status', 'upcoming')
    .order('week_number', { ascending: true })
  if (weeksError) return NextResponse.json({ error: weeksError.message }, { status: 500 })

  const { data: picks, error: picksError } = await supabaseAdmin
    .from('picks')
    .select('game_id, team_picked, picks_wagered')
  if (picksError) return NextResponse.json({ error: picksError.message }, { status: 500 })

  const rows = picks ?? []

  const result = (weeks ?? []).map(week => ({
    week_id: week.id,
    week_number: week.week_number,
    deadline: week.deadline,
    status: week.status,
    games: (week.games ?? []).map(game => {
      const gamePicks = rows.filter(p => p.game_id === game.id)
      const teamNames = [game.away_team, game.home_team]
      const teams = teamNames.map(team => {
        const forTeam = gamePicks.filter(p => p.team_picked === team)
        return {
          team,
          players: forTeam.length,
          picks_wagered: forTeam.reduce((s, p) => s + p.picks_wagered, 0),
        }
      })
      return {
        game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        winning_team: game.winning_team,
        total_players: gamePicks.length,
        total_wagered: gamePicks.reduce((s, p) => s + p.picks_wagered, 0),
        teams,
      }
    }),
  }))

  return NextResponse.json(result)
}
