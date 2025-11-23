-- Sync existing auth users to public.users table
insert into public.users (id, email, created_at)
select id, email, created_at
from auth.users
where not exists (
  select 1 from public.users where public.users.id = auth.users.id
);
