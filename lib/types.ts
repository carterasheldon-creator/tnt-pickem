export type User = {
  id: string
  username: string
  is_admin: boolean
  initial_picks: number
  remaining_picks: number
  created_at: string
}

export type Week = {
  id: string
  week_number: number
  deadline: string
  status: 'upcoming' | 'open' | 'closed' | 'finalized'
  created_at: string
}

export type Game = {
  id: string
  week_id: string
  home_team: string
  away_team: string
  winning_team: string | null
  created_at: string
}

export type Pick = {
  id: string
  user_id: string
  week_id: string
  game_id: string
  team_picked: string
  picks_wagered: number
  result: 'pending' | 'won' | 'lost'
  created_at: string
}

export type LeaderboardEntry = {
  id: string
  username: string
  remaining_picks: number
  initial_picks: number
  total_wins: number
  total_losses: number
}
