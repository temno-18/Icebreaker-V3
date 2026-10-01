-- Icebreaker V3: shared active users + admin-only bans
-- Run this ENTIRE file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.icebreaker_active_users (
  device_id text primary key,
  last_seen timestamptz not null default now(),
  current_path text,
  role text default 'guest',
  has_access_key boolean not null default false
);

create table if not exists public.icebreaker_bans (
  device_id text primary key,
  reason text,
  created_at timestamptz not null default now()
);

-- Admin accounts are Supabase Auth emails listed here.
create table if not exists public.icebreaker_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.icebreaker_active_users enable row level security;
alter table public.icebreaker_bans enable row level security;
alter table public.icebreaker_admins enable row level security;

create or replace function public.icebreaker_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.icebreaker_admins
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

grant execute on function public.icebreaker_is_admin() to anon, authenticated;

-- Activity: visitors may create/update heartbeat rows.
drop policy if exists "active users insert" on public.icebreaker_active_users;
drop policy if exists "active users update" on public.icebreaker_active_users;
drop policy if exists "admins read active users" on public.icebreaker_active_users;

create policy "active users insert"
on public.icebreaker_active_users
for insert to anon, authenticated
with check (true);

create policy "active users update"
on public.icebreaker_active_users
for update to anon, authenticated
using (true)
with check (true);

create policy "admins read active users"
on public.icebreaker_active_users
for select to authenticated
using (public.icebreaker_is_admin());

-- Bans: only admins can view/create/delete bans.
drop policy if exists "admins read bans" on public.icebreaker_bans;
drop policy if exists "admins insert bans" on public.icebreaker_bans;
drop policy if exists "admins update bans" on public.icebreaker_bans;
drop policy if exists "admins delete bans" on public.icebreaker_bans;

create policy "admins read bans"
on public.icebreaker_bans
for select to authenticated
using (public.icebreaker_is_admin());

create policy "admins insert bans"
on public.icebreaker_bans
for insert to authenticated
with check (public.icebreaker_is_admin());

create policy "admins update bans"
on public.icebreaker_bans
for update to authenticated
using (public.icebreaker_is_admin())
with check (public.icebreaker_is_admin());

create policy "admins delete bans"
on public.icebreaker_bans
for delete to authenticated
using (public.icebreaker_is_admin());

-- Public ban check used by every browser. It only returns true/false.
create or replace function public.is_icebreaker_banned(p_device_id text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.icebreaker_bans where device_id = p_device_id
  );
$$;

grant execute on function public.is_icebreaker_banned(text) to anon, authenticated;

-- Add your Supabase Auth admin email here AFTER creating/signing into the account.
-- Example:
-- insert into public.icebreaker_admins(email) values ('you@example.com')
-- on conflict (email) do nothing;

-- Admin RPCs avoid client-side RLS conflicts and enforce the admin check in the database.
create or replace function public.admin_list_icebreaker_users()
returns setof public.icebreaker_active_users
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.icebreaker_is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select * from public.icebreaker_active_users
    order by last_seen desc
    limit 500;
end;
$$;

grant execute on function public.admin_list_icebreaker_users() to authenticated;

create or replace function public.admin_list_icebreaker_bans()
returns setof public.icebreaker_bans
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.icebreaker_is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select * from public.icebreaker_bans
    order by created_at desc;
end;
$$;

grant execute on function public.admin_list_icebreaker_bans() to authenticated;

create or replace function public.admin_ban_icebreaker_device(p_device_id text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.icebreaker_is_admin() then
    raise exception 'not authorized';
  end if;
  insert into public.icebreaker_bans(device_id, reason)
  values (trim(p_device_id), nullif(trim(coalesce(p_reason, '')), ''))
  on conflict (device_id) do update
    set reason = excluded.reason;
end;
$$;

grant execute on function public.admin_ban_icebreaker_device(text, text) to authenticated;

create or replace function public.admin_unban_icebreaker_device(p_device_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.icebreaker_is_admin() then
    raise exception 'not authorized';
  end if;
  delete from public.icebreaker_bans where device_id = trim(p_device_id);
end;
$$;

grant execute on function public.admin_unban_icebreaker_device(text) to authenticated;


-- Realtime troll/announcement system.
create table if not exists public.icebreaker_announcements (
  id bigint generated by default as identity primary key,
  message text not null,
  mode text not null default 'banner',
  duration_ms integer not null default 5000,
  shake boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.icebreaker_sound_events (
  id bigint generated by default as identity primary key,
  sound_url text not null,
  volume numeric not null default 1,
  created_at timestamptz not null default now()
);

alter table public.icebreaker_announcements enable row level security;
alter table public.icebreaker_sound_events enable row level security;

drop policy if exists "public read announcements" on public.icebreaker_announcements;
drop policy if exists "admins insert announcements" on public.icebreaker_announcements;
create policy "public read announcements" on public.icebreaker_announcements for select to anon, authenticated using (true);
create policy "admins insert announcements" on public.icebreaker_announcements for insert to authenticated with check (public.icebreaker_is_admin());

drop policy if exists "public read sound events" on public.icebreaker_sound_events;
drop policy if exists "admins insert sound events" on public.icebreaker_sound_events;
create policy "public read sound events" on public.icebreaker_sound_events for select to anon, authenticated using (true);
create policy "admins insert sound events" on public.icebreaker_sound_events for insert to authenticated with check (public.icebreaker_is_admin());

-- Enable Supabase Realtime for both event tables.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='icebreaker_announcements') then
    alter publication supabase_realtime add table public.icebreaker_announcements;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='icebreaker_sound_events') then
    alter publication supabase_realtime add table public.icebreaker_sound_events;
  end if;
end $$;

-- Only admins can insert through the client; the public can receive realtime events.
