-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (Public profile)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamptz default now(),
  settings jsonb default '{}'::jsonb
);

-- Rules
create table public.rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Setups
create table public.setups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  criteria jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Trades
create table public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  broker_id text,
  symbol text not null,
  direction text not null, -- BUY/SELL
  quantity numeric not null,
  price numeric not null,
  timestamp timestamptz not null,
  fee numeric default 0,
  currency text default 'USD',
  notes text,
  created_at timestamptz default now()
);

-- Positions
create table public.positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  symbol text not null,
  status text not null, -- OPEN/CLOSED
  open_date timestamptz not null,
  close_date timestamptz,
  avg_entry_price numeric not null,
  avg_exit_price numeric,
  quantity numeric not null,
  pnl_realized numeric,
  pnl_percent numeric,
  setup_id uuid references public.setups(id),
  mistakes jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Journal Entries
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  content text,
  mood_score integer,
  tags text[],
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.users enable row level security;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

alter table public.rules enable row level security;
create policy "Users can view own rules" on public.rules for select using (auth.uid() = user_id);
create policy "Users can insert own rules" on public.rules for insert with check (auth.uid() = user_id);
create policy "Users can update own rules" on public.rules for update using (auth.uid() = user_id);
create policy "Users can delete own rules" on public.rules for delete using (auth.uid() = user_id);

alter table public.setups enable row level security;
create policy "Users can view own setups" on public.setups for select using (auth.uid() = user_id);
create policy "Users can insert own setups" on public.setups for insert with check (auth.uid() = user_id);
create policy "Users can update own setups" on public.setups for update using (auth.uid() = user_id);
create policy "Users can delete own setups" on public.setups for delete using (auth.uid() = user_id);

alter table public.trades enable row level security;
create policy "Users can view own trades" on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades" on public.trades for update using (auth.uid() = user_id);
create policy "Users can delete own trades" on public.trades for delete using (auth.uid() = user_id);

alter table public.positions enable row level security;
create policy "Users can view own positions" on public.positions for select using (auth.uid() = user_id);
create policy "Users can insert own positions" on public.positions for insert with check (auth.uid() = user_id);
create policy "Users can update own positions" on public.positions for update using (auth.uid() = user_id);
create policy "Users can delete own positions" on public.positions for delete using (auth.uid() = user_id);

alter table public.journal_entries enable row level security;
create policy "Users can view own journal" on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own journal" on public.journal_entries for update using (auth.uid() = user_id);
create policy "Users can delete own journal" on public.journal_entries for delete using (auth.uid() = user_id);

-- Trigger to create public.users on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
