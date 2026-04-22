-- ─── Agora : tables forum ──────────────────────────────────────────────────

-- Topics (sujets du forum)
create table if not exists public.agora_topics (
  id               uuid primary key default gen_random_uuid(),
  titre            text        not null check (char_length(titre) between 3 and 200),
  contenu          text        not null check (char_length(contenu) between 10 and 5000),
  categorie        text        not null check (categorie in (
    'Général', 'Théories & Analyses', 'Recommandations',
    'Écriture', 'Débats', 'Communauté'
  )),
  auteur_id        uuid        not null references auth.users(id) on delete cascade,
  auteur_username  text        not null,
  vues             integer     not null default 0,
  nb_reponses      integer     not null default 0,
  epingle          boolean     not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Replies (réponses aux sujets)
create table if not exists public.agora_replies (
  id               uuid primary key default gen_random_uuid(),
  topic_id         uuid        not null references public.agora_topics(id) on delete cascade,
  contenu          text        not null check (char_length(contenu) between 1 and 3000),
  auteur_id        uuid        not null references auth.users(id) on delete cascade,
  auteur_username  text        not null,
  created_at       timestamptz not null default now()
);

-- Index utiles
create index if not exists agora_topics_updated_at_idx on public.agora_topics(updated_at desc);
create index if not exists agora_replies_topic_id_idx  on public.agora_replies(topic_id);

-- RLS : tout le monde peut lire, seuls les connectés peuvent écrire
alter table public.agora_topics  enable row level security;
alter table public.agora_replies enable row level security;

-- Topics : lecture publique
create policy "agora_topics_read"
  on public.agora_topics for select
  using (true);

-- Topics : insertion pour les utilisateurs authentifiés
create policy "agora_topics_insert"
  on public.agora_topics for insert
  to authenticated
  with check (auteur_id = auth.uid());

-- Replies : lecture publique
create policy "agora_replies_read"
  on public.agora_replies for select
  using (true);

-- Replies : insertion pour les utilisateurs authentifiés
create policy "agora_replies_insert"
  on public.agora_replies for insert
  to authenticated
  with check (auteur_id = auth.uid());

-- ─── Fonctions RPC ─────────────────────────────────────────────────────────

-- Incrémenter les vues d'un topic (contourne RLS car security definer)
create or replace function public.increment_topic_views(topic_id uuid)
returns void
language sql
security definer
as $$
  update public.agora_topics
  set vues = vues + 1
  where id = topic_id;
$$;

-- Incrémenter nb_reponses + mettre à jour updated_at
create or replace function public.increment_topic_replies(topic_id uuid)
returns void
language sql
security definer
as $$
  update public.agora_topics
  set nb_reponses = nb_reponses + 1,
      updated_at  = now()
  where id = topic_id;
$$;
