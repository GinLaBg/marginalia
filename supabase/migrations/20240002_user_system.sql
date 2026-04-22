-- Profiles publics
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  bio         text default '',
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update to authenticated using (id = auth.uid());

-- Trigger pour créer le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Abonnements (follows)
create table if not exists public.user_follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.user_follows enable row level security;
create policy "follows_read"   on public.user_follows for select using (true);
create policy "follows_insert" on public.user_follows for insert to authenticated with check (follower_id = auth.uid());
create policy "follows_delete" on public.user_follows for delete to authenticated using (follower_id = auth.uid());

-- Notifications
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null check (type in ('comment','follow','agora_reply','review')),
  source_user_id  uuid references auth.users(id) on delete cascade,
  source_username text,
  content_id      text,
  content_url     text,
  message         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);
create index if not exists notifications_user_id_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "notifications_read"   on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_insert" on public.notifications for insert to authenticated with check (true);
create policy "notifications_update" on public.notifications for update to authenticated using (user_id = auth.uid());

-- Préférences profil
create table if not exists public.user_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  show_drafts          boolean default false,
  show_ongoing         boolean default true,
  show_finished        boolean default true,
  show_agora_activity  boolean default true,
  featured_stories     uuid[] default '{}',
  updated_at           timestamptz default now()
);
alter table public.user_preferences enable row level security;
create policy "prefs_read"   on public.user_preferences for select using (true);
create policy "prefs_insert" on public.user_preferences for insert to authenticated with check (user_id = auth.uid());
create policy "prefs_update" on public.user_preferences for update to authenticated using (user_id = auth.uid());

-- Vues par chapitre
alter table public.chapters add column if not exists views_count integer not null default 0;

-- RPC incrémenter vues chapitre
create or replace function public.increment_chapter_views(chapter_id uuid)
returns void language sql security definer as $$
  update public.chapters set views_count = views_count + 1 where id = chapter_id;
$$;

-- RPC marquer notifications lues
create or replace function public.mark_notifications_read(p_user_id uuid)
returns void language sql security definer as $$
  update public.notifications set is_read = true where user_id = p_user_id and is_read = false;
$$;
