-- ── Fix RLS : suppression de ses propres commentaires/réponses ──────────────

-- chapter_comments : DELETE policy manquante
ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_delete" ON public.chapter_comments;
CREATE POLICY "comments_delete" ON public.chapter_comments
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Assure qu'il y a bien les autres policies sur chapter_comments
DROP POLICY IF EXISTS "comments_read"   ON public.chapter_comments;
DROP POLICY IF EXISTS "comments_insert" ON public.chapter_comments;
CREATE POLICY "comments_read"   ON public.chapter_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.chapter_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- agora_replies : DELETE policy manquante
DROP POLICY IF EXISTS "agora_replies_delete" ON public.agora_replies;
CREATE POLICY "agora_replies_delete" ON public.agora_replies
  FOR DELETE TO authenticated USING (auteur_id = auth.uid());

-- ── Rôles admin ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'moderator', 'admin', 'super_admin'));

-- ── Table des signalements ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT        NOT NULL CHECK (content_type IN ('comment', 'reply', 'topic')),
  content_id   TEXT        NOT NULL,
  reason       TEXT        NOT NULL CHECK (reason IN ('spam', 'abuse', 'inappropriate', 'other')),
  message      TEXT,
  status       TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'ignored')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES auth.users(id)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur connecté peut créer un signalement
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

-- Seuls les admins peuvent lire les signalements
CREATE POLICY "reports_admin_read" ON public.reports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  ));

-- Seuls les admins peuvent mettre à jour le statut
CREATE POLICY "reports_admin_update" ON public.reports
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  ));

-- Seuls les super_admin peuvent supprimer
CREATE POLICY "reports_admin_delete" ON public.reports
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin')
  ));

-- Index
CREATE INDEX IF NOT EXISTS reports_status_idx    ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_idx  ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_content_idx   ON public.reports(content_type, content_id);

-- ── RPC : un utilisateur peut-il supprimer son propre contenu ? ──────────────
-- RPC pour qu'un admin supprime un contenu signalé (security definer)
CREATE OR REPLACE FUNCTION admin_delete_content(p_content_type TEXT, p_content_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Vérifie que l'appelant est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','moderator')
  ) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF p_content_type = 'comment' THEN
    DELETE FROM public.chapter_comments WHERE id = p_content_id;
  ELSIF p_content_type = 'reply' THEN
    DELETE FROM public.agora_replies WHERE id = p_content_id;
  ELSIF p_content_type = 'topic' THEN
    DELETE FROM public.agora_topics WHERE id = p_content_id;
  END IF;
END;
$$;
