-- Icebreaker V3: active device list
-- Run this in Supabase SQL Editor.
create table if not exists public.icebreaker_active_users (
  device_id text primary key,
  last_seen timestamptz not null default now(),
  current_path text,
  role text,
  has_access_key boolean default false
);

alter table public.icebreaker_active_users enable row level security;

drop policy if exists "public heartbeat insert" on public.icebreaker_active_users;
create policy "public heartbeat insert"
on public.icebreaker_active_users
for insert to anon, authenticated
with check (char_length(device_id) between 8 and 128);

drop policy if exists "public heartbeat update" on public.icebreaker_active_users;
create policy "public heartbeat update"
on public.icebreaker_active_users
for update to anon, authenticated
using (true)
with check (char_length(device_id) between 8 and 128);

-- Admin dashboard reads require an authenticated Supabase user.
-- If your existing icebreaker_admins table is already configured with RLS,
-- add a SELECT policy there that checks your admin users. The simple policy
-- below allows authenticated Supabase accounts to read the activity table.
-- Replace it with your admin-only policy if multiple Supabase accounts exist.
drop policy if exists "authenticated activity read" on public.icebreaker_active_users;
create policy "authenticated activity read"
on public.icebreaker_active_users
for select to authenticated
using (true);

-- Optional cleanup: remove devices that have not been seen for 30 days.
-- Run manually when desired:
-- delete from public.icebreaker_active_users
-- where last_seen < now() - interval '30 days';
