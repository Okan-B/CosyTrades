create table public.stock_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  symbol text not null,
  title text,
  content jsonb,
  position jsonb,
  size jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.stock_notes enable row level security;

create policy "Users can view own stock notes"
  on public.stock_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own stock notes"
  on public.stock_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stock notes"
  on public.stock_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own stock notes"
  on public.stock_notes for delete
  using (auth.uid() = user_id);

create or replace function public.update_stock_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stock_notes_updated_at
  before update on public.stock_notes
  for each row
  execute procedure public.update_stock_notes_updated_at();
