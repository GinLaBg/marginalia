-- ── Bibliothèque personnelle ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_library (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id   UUID        NOT NULL REFERENCES stories(id)   ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'to_read' CHECK (status IN ('to_read','reading','read')),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_read"   ON user_library FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "library_insert" ON user_library FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "library_update" ON user_library FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "library_delete" ON user_library FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── Abonnements canaux Agora ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agora_subscriptions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categorie  TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, categorie)
);
ALTER TABLE agora_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agora_sub_read"   ON agora_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "agora_sub_insert" ON agora_subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "agora_sub_delete" ON agora_subscriptions FOR DELETE TO authenticated USING (user_id = auth.uid());
