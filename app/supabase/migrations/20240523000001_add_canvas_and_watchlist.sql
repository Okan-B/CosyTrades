-- Canvases Table
create table public.canvases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  layout jsonb default '{}'::jsonb,
  is_default boolean default false,
  is_public boolean default false,
  tags text[],
  likes_count integer default 0,
  cloned_from_id uuid references public.canvases(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Watchlist Items Table
create table public.watchlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  symbol text not null,
  added_at timestamptz default now(),
  has_notes boolean default false,
  display_order integer
);

-- RLS for Canvases
alter table public.canvases enable row level security;

create policy "Users can view own canvases" 
  on public.canvases for select 
  using (auth.uid() = user_id);

create policy "Users can view public canvases" 
  on public.canvases for select 
  using (is_public = true);

create policy "Users can insert own canvases" 
  on public.canvases for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own canvases" 
  on public.canvases for update 
  using (auth.uid() = user_id);

create policy "Users can delete own canvases" 
  on public.canvases for delete 
  using (auth.uid() = user_id);

-- RLS for Watchlist Items
alter table public.watchlist_items enable row level security;

create policy "Users can view own watchlist" 
  on public.watchlist_items for select 
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist" 
  on public.watchlist_items for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own watchlist" 
  on public.watchlist_items for update 
  using (auth.uid() = user_id);

create policy "Users can delete own watchlist" 
  on public.watchlist_items for delete 
  using (auth.uid() = user_id);
