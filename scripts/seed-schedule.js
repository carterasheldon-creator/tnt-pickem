const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Deadlines below are Arizona wall-clock times (America/Phoenix, fixed UTC-7, no DST).
// Pin that offset so Postgres stores the correct absolute instant.
const ARIZONA_UTC_OFFSET = '-07:00'
const toUtc = local => new Date(`${local}${ARIZONA_UTC_OFFSET}`).toISOString()

const schedule = [
  {
    week_number: 1,
    deadline: '2026-09-09T19:00:00', // First game is Wed Sept 9 at 8:20 PM — deadline before it
    games: [
      { away: 'Seattle Seahawks', home: 'New England Patriots' },
      { away: 'San Francisco 49ers', home: 'Los Angeles Rams' },
      { away: 'Buffalo Bills', home: 'Houston Texans' },
      { away: 'New York Jets', home: 'Tennessee Titans' },
      { away: 'Baltimore Ravens', home: 'Indianapolis Colts' },
      { away: 'Tampa Bay Buccaneers', home: 'Cincinnati Bengals' },
      { away: 'Cleveland Browns', home: 'Jacksonville Jaguars' },
      { away: 'Atlanta Falcons', home: 'Pittsburgh Steelers' },
      { away: 'Chicago Bears', home: 'Carolina Panthers' },
      { away: 'New Orleans Saints', home: 'Detroit Lions' },
      { away: 'Miami Dolphins', home: 'Las Vegas Raiders' },
      { away: 'Arizona Cardinals', home: 'Los Angeles Chargers' },
      { away: 'Green Bay Packers', home: 'Minnesota Vikings' },
      { away: 'Washington Commanders', home: 'Philadelphia Eagles' },
      { away: 'Dallas Cowboys', home: 'New York Giants' },
      { away: 'Denver Broncos', home: 'Kansas City Chiefs' },
    ],
  },
  {
    week_number: 2,
    deadline: '2026-09-16T23:59:00',
    games: [
      { away: 'Detroit Lions', home: 'Buffalo Bills' },
      { away: 'Pittsburgh Steelers', home: 'New England Patriots' },
      { away: 'Green Bay Packers', home: 'New York Jets' },
      { away: 'Cleveland Browns', home: 'Tampa Bay Buccaneers' },
      { away: 'Philadelphia Eagles', home: 'Tennessee Titans' },
      { away: 'Minnesota Vikings', home: 'Chicago Bears' },
      { away: 'Carolina Panthers', home: 'Atlanta Falcons' },
      { away: 'New Orleans Saints', home: 'Baltimore Ravens' },
      { away: 'Cincinnati Bengals', home: 'Houston Texans' },
      { away: 'Jacksonville Jaguars', home: 'Denver Broncos' },
      { away: 'Las Vegas Raiders', home: 'Los Angeles Chargers' },
      { away: 'Miami Dolphins', home: 'San Francisco 49ers' },
      { away: 'Washington Commanders', home: 'Dallas Cowboys' },
      { away: 'Seattle Seahawks', home: 'Arizona Cardinals' },
      { away: 'Indianapolis Colts', home: 'Kansas City Chiefs' },
      { away: 'New York Giants', home: 'Los Angeles Rams' },
    ],
  },
  {
    week_number: 3,
    deadline: '2026-09-23T23:59:00',
    games: [
      { away: 'Atlanta Falcons', home: 'Green Bay Packers' },
      { away: 'New England Patriots', home: 'Jacksonville Jaguars' },
      { away: 'Cincinnati Bengals', home: 'Pittsburgh Steelers' },
      { away: 'Tennessee Titans', home: 'New York Giants' },
      { away: 'Seattle Seahawks', home: 'Washington Commanders' },
      { away: 'Houston Texans', home: 'Indianapolis Colts' },
      { away: 'Los Angeles Chargers', home: 'Buffalo Bills' },
      { away: 'New York Jets', home: 'Detroit Lions' },
      { away: 'Carolina Panthers', home: 'Cleveland Browns' },
      { away: 'Kansas City Chiefs', home: 'Miami Dolphins' },
      { away: 'Minnesota Vikings', home: 'Tampa Bay Buccaneers' },
      { away: 'Arizona Cardinals', home: 'San Francisco 49ers' },
      { away: 'Las Vegas Raiders', home: 'New Orleans Saints' },
      { away: 'Baltimore Ravens', home: 'Dallas Cowboys' },
      { away: 'Los Angeles Rams', home: 'Denver Broncos' },
      { away: 'Philadelphia Eagles', home: 'Chicago Bears' },
    ],
  },
  {
    week_number: 4,
    deadline: '2026-09-30T23:59:00',
    games: [
      { away: 'Pittsburgh Steelers', home: 'Cleveland Browns' },
      { away: 'Indianapolis Colts', home: 'Washington Commanders' },
      { away: 'New York Jets', home: 'Chicago Bears' },
      { away: 'Arizona Cardinals', home: 'New York Giants' },
      { away: 'Los Angeles Rams', home: 'Philadelphia Eagles' },
      { away: 'New England Patriots', home: 'Buffalo Bills' },
      { away: 'Tennessee Titans', home: 'Baltimore Ravens' },
      { away: 'Jacksonville Jaguars', home: 'Cincinnati Bengals' },
      { away: 'Dallas Cowboys', home: 'Houston Texans' },
      { away: 'Green Bay Packers', home: 'Tampa Bay Buccaneers' },
      { away: 'Miami Dolphins', home: 'Minnesota Vikings' },
      { away: 'Kansas City Chiefs', home: 'Las Vegas Raiders' },
      { away: 'Denver Broncos', home: 'San Francisco 49ers' },
      { away: 'Los Angeles Chargers', home: 'Seattle Seahawks' },
      { away: 'Detroit Lions', home: 'Carolina Panthers' },
      { away: 'Atlanta Falcons', home: 'New Orleans Saints' },
    ],
  },
  {
    week_number: 5,
    deadline: '2026-10-07T23:59:00',
    games: [
      { away: 'Tampa Bay Buccaneers', home: 'Dallas Cowboys' },
      { away: 'Philadelphia Eagles', home: 'Jacksonville Jaguars' },
      { away: 'Cleveland Browns', home: 'New York Jets' },
      { away: 'Cincinnati Bengals', home: 'Miami Dolphins' },
      { away: 'Las Vegas Raiders', home: 'New England Patriots' },
      { away: 'Houston Texans', home: 'Tennessee Titans' },
      { away: 'Indianapolis Colts', home: 'Pittsburgh Steelers' },
      { away: 'New York Giants', home: 'Washington Commanders' },
      { away: 'Minnesota Vikings', home: 'New Orleans Saints' },
      { away: 'Denver Broncos', home: 'Los Angeles Chargers' },
      { away: 'Chicago Bears', home: 'Green Bay Packers' },
      { away: 'San Francisco 49ers', home: 'Seattle Seahawks' },
      { away: 'Detroit Lions', home: 'Arizona Cardinals' },
      { away: 'Baltimore Ravens', home: 'Atlanta Falcons' },
      { away: 'Buffalo Bills', home: 'Los Angeles Rams' },
    ],
  },
  {
    week_number: 6,
    deadline: '2026-10-14T23:59:00',
    games: [
      { away: 'Seattle Seahawks', home: 'Denver Broncos' },
      { away: 'Houston Texans', home: 'Jacksonville Jaguars' },
      { away: 'New Orleans Saints', home: 'New York Giants' },
      { away: 'Carolina Panthers', home: 'Philadelphia Eagles' },
      { away: 'Baltimore Ravens', home: 'Cleveland Browns' },
      { away: 'Pittsburgh Steelers', home: 'Tampa Bay Buccaneers' },
      { away: 'Tennessee Titans', home: 'Indianapolis Colts' },
      { away: 'Chicago Bears', home: 'Atlanta Falcons' },
      { away: 'New York Jets', home: 'New England Patriots' },
      { away: 'Arizona Cardinals', home: 'Los Angeles Rams' },
      { away: 'Los Angeles Chargers', home: 'Kansas City Chiefs' },
      { away: 'Buffalo Bills', home: 'Las Vegas Raiders' },
      { away: 'Dallas Cowboys', home: 'Green Bay Packers' },
      { away: 'Washington Commanders', home: 'San Francisco 49ers' },
    ],
  },
  {
    week_number: 7,
    deadline: '2026-10-21T23:59:00',
    games: [
      { away: 'New England Patriots', home: 'Chicago Bears' },
      { away: 'Pittsburgh Steelers', home: 'New Orleans Saints' },
      { away: 'Miami Dolphins', home: 'New York Jets' },
      { away: 'Cincinnati Bengals', home: 'Baltimore Ravens' },
      { away: 'Cleveland Browns', home: 'Tennessee Titans' },
      { away: 'New York Giants', home: 'Houston Texans' },
      { away: 'Indianapolis Colts', home: 'Minnesota Vikings' },
      { away: 'San Francisco 49ers', home: 'Atlanta Falcons' },
      { away: 'Tampa Bay Buccaneers', home: 'Carolina Panthers' },
      { away: 'Denver Broncos', home: 'Arizona Cardinals' },
      { away: 'Los Angeles Rams', home: 'Las Vegas Raiders' },
      { away: 'Green Bay Packers', home: 'Detroit Lions' },
      { away: 'Kansas City Chiefs', home: 'Seattle Seahawks' },
      { away: 'Dallas Cowboys', home: 'Philadelphia Eagles' },
    ],
  },
  {
    week_number: 8,
    deadline: '2026-10-28T23:59:00',
    games: [
      { away: 'Carolina Panthers', home: 'Green Bay Packers' },
      { away: 'Baltimore Ravens', home: 'Buffalo Bills' },
      { away: 'Las Vegas Raiders', home: 'New York Jets' },
      { away: 'Cleveland Browns', home: 'Pittsburgh Steelers' },
      { away: 'Indianapolis Colts', home: 'Jacksonville Jaguars' },
      { away: 'Atlanta Falcons', home: 'Tampa Bay Buccaneers' },
      { away: 'Tennessee Titans', home: 'Cincinnati Bengals' },
      { away: 'Arizona Cardinals', home: 'Dallas Cowboys' },
      { away: 'Minnesota Vikings', home: 'Detroit Lions' },
      { away: 'Los Angeles Chargers', home: 'Los Angeles Rams' },
      { away: 'Kansas City Chiefs', home: 'Denver Broncos' },
      { away: 'New England Patriots', home: 'Miami Dolphins' },
      { away: 'Philadelphia Eagles', home: 'Washington Commanders' },
      { away: 'Chicago Bears', home: 'Seattle Seahawks' },
    ],
  },
  {
    week_number: 9,
    deadline: '2026-11-04T23:59:00',
    games: [
      { away: 'Jacksonville Jaguars', home: 'Baltimore Ravens' },
      { away: 'Cincinnati Bengals', home: 'Atlanta Falcons' },
      { away: 'Denver Broncos', home: 'Carolina Panthers' },
      { away: 'Los Angeles Rams', home: 'Washington Commanders' },
      { away: 'New York Jets', home: 'Kansas City Chiefs' },
      { away: 'Cleveland Browns', home: 'New Orleans Saints' },
      { away: 'New York Giants', home: 'Philadelphia Eagles' },
      { away: 'Dallas Cowboys', home: 'Indianapolis Colts' },
      { away: 'Detroit Lions', home: 'Miami Dolphins' },
      { away: 'Las Vegas Raiders', home: 'San Francisco 49ers' },
      { away: 'Houston Texans', home: 'Los Angeles Chargers' },
      { away: 'Arizona Cardinals', home: 'Seattle Seahawks' },
      { away: 'Green Bay Packers', home: 'New England Patriots' },
      { away: 'Tampa Bay Buccaneers', home: 'Chicago Bears' },
      { away: 'Buffalo Bills', home: 'Minnesota Vikings' },
    ],
  },
  {
    week_number: 10,
    deadline: '2026-11-11T23:59:00',
    games: [
      { away: 'Washington Commanders', home: 'New York Giants' },
      { away: 'New England Patriots', home: 'Detroit Lions' },
      { away: 'Buffalo Bills', home: 'New York Jets' },
      { away: 'Miami Dolphins', home: 'Indianapolis Colts' },
      { away: 'Houston Texans', home: 'Cleveland Browns' },
      { away: 'Jacksonville Jaguars', home: 'Tennessee Titans' },
      { away: 'Kansas City Chiefs', home: 'Atlanta Falcons' },
      { away: 'Minnesota Vikings', home: 'Green Bay Packers' },
      { away: 'Carolina Panthers', home: 'New Orleans Saints' },
      { away: 'Seattle Seahawks', home: 'Las Vegas Raiders' },
      { away: 'San Francisco 49ers', home: 'Dallas Cowboys' },
      { away: 'Los Angeles Rams', home: 'Arizona Cardinals' },
      { away: 'Pittsburgh Steelers', home: 'Cincinnati Bengals' },
      { away: 'Baltimore Ravens', home: 'Los Angeles Chargers' },
    ],
  },
  {
    week_number: 11,
    deadline: '2026-11-18T23:59:00',
    games: [
      { away: 'Indianapolis Colts', home: 'Houston Texans' },
      { away: 'Baltimore Ravens', home: 'Carolina Panthers' },
      { away: 'Jacksonville Jaguars', home: 'New York Giants' },
      { away: 'New Orleans Saints', home: 'Chicago Bears' },
      { away: 'Arizona Cardinals', home: 'Kansas City Chiefs' },
      { away: 'Miami Dolphins', home: 'Buffalo Bills' },
      { away: 'Tampa Bay Buccaneers', home: 'Detroit Lions' },
      { away: 'Tennessee Titans', home: 'Dallas Cowboys' },
      { away: 'New York Jets', home: 'Los Angeles Chargers' },
      { away: 'Pittsburgh Steelers', home: 'Philadelphia Eagles' },
      { away: 'Las Vegas Raiders', home: 'Denver Broncos' },
      { away: 'Minnesota Vikings', home: 'San Francisco 49ers' },
      { away: 'Cincinnati Bengals', home: 'Washington Commanders' },
    ],
  },
  {
    week_number: 12,
    deadline: '2026-11-25T19:00:00', // First game is Wed Nov 25 at 8 PM — deadline before it
    games: [
      { away: 'Green Bay Packers', home: 'Los Angeles Rams' },
      { away: 'Chicago Bears', home: 'Detroit Lions' },
      { away: 'Philadelphia Eagles', home: 'Dallas Cowboys' },
      { away: 'Kansas City Chiefs', home: 'Buffalo Bills' },
      { away: 'Denver Broncos', home: 'Pittsburgh Steelers' },
      { away: 'Baltimore Ravens', home: 'Houston Texans' },
      { away: 'New York Giants', home: 'Indianapolis Colts' },
      { away: 'Las Vegas Raiders', home: 'Cleveland Browns' },
      { away: 'New Orleans Saints', home: 'Cincinnati Bengals' },
      { away: 'Miami Dolphins', home: 'New York Jets' },
      { away: 'Atlanta Falcons', home: 'Minnesota Vikings' },
      { away: 'Tennessee Titans', home: 'Jacksonville Jaguars' },
      { away: 'Seattle Seahawks', home: 'San Francisco 49ers' },
      { away: 'Washington Commanders', home: 'Arizona Cardinals' },
      { away: 'New England Patriots', home: 'Los Angeles Chargers' },
      { away: 'Carolina Panthers', home: 'Tampa Bay Buccaneers' },
    ],
  },
  {
    week_number: 13,
    deadline: '2026-12-02T23:59:00',
    games: [
      { away: 'Kansas City Chiefs', home: 'Los Angeles Rams' },
      { away: 'Jacksonville Jaguars', home: 'Chicago Bears' },
      { away: 'Washington Commanders', home: 'Tennessee Titans' },
      { away: 'San Francisco 49ers', home: 'New York Giants' },
      { away: 'Detroit Lions', home: 'Atlanta Falcons' },
      { away: 'Cincinnati Bengals', home: 'Cleveland Browns' },
      { away: 'Los Angeles Chargers', home: 'Tampa Bay Buccaneers' },
      { away: 'Green Bay Packers', home: 'New Orleans Saints' },
      { away: 'Miami Dolphins', home: 'Denver Broncos' },
      { away: 'Philadelphia Eagles', home: 'Arizona Cardinals' },
      { away: 'Buffalo Bills', home: 'New England Patriots' },
      { away: 'Carolina Panthers', home: 'Minnesota Vikings' },
      { away: 'Houston Texans', home: 'Pittsburgh Steelers' },
      { away: 'Dallas Cowboys', home: 'Seattle Seahawks' },
    ],
  },
  {
    week_number: 14,
    deadline: '2026-12-09T23:59:00',
    games: [
      { away: 'Minnesota Vikings', home: 'New England Patriots' },
      { away: 'Chicago Bears', home: 'Miami Dolphins' },
      { away: 'Denver Broncos', home: 'New York Jets' },
      { away: 'Atlanta Falcons', home: 'Cleveland Browns' },
      { away: 'Houston Texans', home: 'Washington Commanders' },
      { away: 'New Orleans Saints', home: 'Carolina Panthers' },
      { away: 'Tampa Bay Buccaneers', home: 'Baltimore Ravens' },
      { away: 'Tennessee Titans', home: 'Detroit Lions' },
      { away: 'Indianapolis Colts', home: 'Philadelphia Eagles' },
      { away: 'Los Angeles Chargers', home: 'Las Vegas Raiders' },
      { away: 'New York Giants', home: 'Seattle Seahawks' },
      { away: 'Kansas City Chiefs', home: 'Cincinnati Bengals' },
      { away: 'Los Angeles Rams', home: 'San Francisco 49ers' },
      { away: 'Buffalo Bills', home: 'Green Bay Packers' },
      { away: 'Pittsburgh Steelers', home: 'Jacksonville Jaguars' },
    ],
  },
  {
    week_number: 15,
    deadline: '2026-12-16T23:59:00',
    games: [
      { away: 'San Francisco 49ers', home: 'Los Angeles Chargers' },
      { away: 'Seattle Seahawks', home: 'Philadelphia Eagles' },
      { away: 'Chicago Bears', home: 'Buffalo Bills' },
      { away: 'Baltimore Ravens', home: 'Pittsburgh Steelers' },
      { away: 'Cincinnati Bengals', home: 'Carolina Panthers' },
      { away: 'Cleveland Browns', home: 'New York Giants' },
      { away: 'Jacksonville Jaguars', home: 'Houston Texans' },
      { away: 'Indianapolis Colts', home: 'Tennessee Titans' },
      { away: 'Atlanta Falcons', home: 'Washington Commanders' },
      { away: 'Miami Dolphins', home: 'Green Bay Packers' },
      { away: 'New Orleans Saints', home: 'Tampa Bay Buccaneers' },
      { away: 'New York Jets', home: 'Arizona Cardinals' },
      { away: 'Dallas Cowboys', home: 'Los Angeles Rams' },
      { away: 'Denver Broncos', home: 'Las Vegas Raiders' },
      { away: 'Detroit Lions', home: 'Minnesota Vikings' },
      { away: 'New England Patriots', home: 'Kansas City Chiefs' },
    ],
  },
  {
    week_number: 16,
    deadline: '2026-12-23T23:59:00',
    games: [
      { away: 'Houston Texans', home: 'Philadelphia Eagles' },
      { away: 'Green Bay Packers', home: 'Chicago Bears' },
      { away: 'Buffalo Bills', home: 'Denver Broncos' },
      { away: 'Los Angeles Rams', home: 'Seattle Seahawks' },
      { away: 'Cincinnati Bengals', home: 'Indianapolis Colts' },
      { away: 'Carolina Panthers', home: 'Pittsburgh Steelers' },
      { away: 'Washington Commanders', home: 'Minnesota Vikings' },
      { away: 'Tampa Bay Buccaneers', home: 'Atlanta Falcons' },
      { away: 'Arizona Cardinals', home: 'New Orleans Saints' },
      { away: 'Los Angeles Chargers', home: 'Miami Dolphins' },
      { away: 'New England Patriots', home: 'New York Jets' },
      { away: 'Cleveland Browns', home: 'Baltimore Ravens' },
      { away: 'Tennessee Titans', home: 'Las Vegas Raiders' },
      { away: 'San Francisco 49ers', home: 'Kansas City Chiefs' },
      { away: 'Jacksonville Jaguars', home: 'Dallas Cowboys' },
      { away: 'New York Giants', home: 'Detroit Lions' },
    ],
  },
  {
    week_number: 17,
    deadline: '2026-12-30T23:59:00',
    games: [
      { away: 'Baltimore Ravens', home: 'Cincinnati Bengals' },
      { away: 'Washington Commanders', home: 'Jacksonville Jaguars' },
      { away: 'Los Angeles Rams', home: 'Tampa Bay Buccaneers' },
      { away: 'Kansas City Chiefs', home: 'Los Angeles Chargers' },
      { away: 'Denver Broncos', home: 'New England Patriots' },
      { away: 'Buffalo Bills', home: 'Miami Dolphins' },
      { away: 'Minnesota Vikings', home: 'New York Jets' },
      { away: 'Indianapolis Colts', home: 'Cleveland Browns' },
      { away: 'Pittsburgh Steelers', home: 'Tennessee Titans' },
      { away: 'New York Giants', home: 'Dallas Cowboys' },
      { away: 'Seattle Seahawks', home: 'Carolina Panthers' },
      { away: 'New Orleans Saints', home: 'Atlanta Falcons' },
      { away: 'Las Vegas Raiders', home: 'Arizona Cardinals' },
      { away: 'Detroit Lions', home: 'Chicago Bears' },
      { away: 'Philadelphia Eagles', home: 'San Francisco 49ers' },
      { away: 'Houston Texans', home: 'Green Bay Packers' },
    ],
  },
  {
    week_number: 18,
    deadline: '2027-01-06T23:59:00',
    games: [
      { away: 'New York Jets', home: 'Buffalo Bills' },
      { away: 'Miami Dolphins', home: 'New England Patriots' },
      { away: 'Cleveland Browns', home: 'Cincinnati Bengals' },
      { away: 'Pittsburgh Steelers', home: 'Baltimore Ravens' },
      { away: 'Jacksonville Jaguars', home: 'Indianapolis Colts' },
      { away: 'Tennessee Titans', home: 'Houston Texans' },
      { away: 'Las Vegas Raiders', home: 'Kansas City Chiefs' },
      { away: 'Los Angeles Chargers', home: 'Denver Broncos' },
      { away: 'Dallas Cowboys', home: 'Washington Commanders' },
      { away: 'Philadelphia Eagles', home: 'New York Giants' },
      { away: 'Chicago Bears', home: 'Minnesota Vikings' },
      { away: 'Detroit Lions', home: 'Green Bay Packers' },
      { away: 'Atlanta Falcons', home: 'Carolina Panthers' },
      { away: 'Tampa Bay Buccaneers', home: 'New Orleans Saints' },
      { away: 'San Francisco 49ers', home: 'Arizona Cardinals' },
      { away: 'Seattle Seahawks', home: 'Los Angeles Rams' },
    ],
  },
]

async function seed() {
  console.log('Seeding schedule...')

  for (const week of schedule) {
    // Insert week
    const { data: weekData, error: weekError } = await supabase
      .from('weeks')
      .insert({
        week_number: week.week_number,
        deadline: toUtc(week.deadline),
        status: 'upcoming',
      })
      .select()
      .single()

    if (weekError) {
      console.error(`Week ${week.week_number} error:`, weekError.message)
      continue
    }

    console.log(`Week ${week.week_number} created`)

    // Insert games for this week
    const gameRows = week.games.map(g => ({
      week_id: weekData.id,
      away_team: g.away,
      home_team: g.home,
    }))

    const { error: gamesError } = await supabase.from('games').insert(gameRows)
    if (gamesError) {
      console.error(`Games for week ${week.week_number} error:`, gamesError.message)
    } else {
      console.log(`  ${gameRows.length} games added`)
    }
  }

  console.log('\nDone! All 18 weeks and games loaded.')
}

seed()
