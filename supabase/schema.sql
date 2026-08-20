-- Football Pick'em Database Schema

create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  is_admin boolean default false,
  initial_picks integer not null default 10,
  remaining_picks integer not null default 10,
  created_at timestamptz default now()
);

create table weeks (
  id uuid primary key default gen_random_uuid(),
  week_number integer unique not null,
  deadline timestamptz not null,
  status text not null default 'upcoming', -- upcoming | open | closed | finalized
  created_at timestamptz default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references weeks(id) on delete cascade not null,
  home_team text not null,
  away_team text not null,
  winning_team text, -- null until admin marks result
  created_at timestamptz default now()
);

create table picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  week_id uuid references weeks(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  team_picked text not null,
  picks_wagered integer not null,
  result text default 'pending', -- pending | won | lost
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- View: leaderboard
create view leaderboard as
  select
    u.id,
    u.username,
    u.remaining_picks,
    u.initial_picks,
    count(p.id) filter (where p.result = 'won') as total_wins,
    count(p.id) filter (where p.result = 'lost') as total_losses
  from users u
  left join picks p on p.user_id = u.id
  where u.is_admin = false
  group by u.id, u.username, u.remaining_picks, u.initial_picks
  order by u.remaining_picks desc, total_wins desc;
