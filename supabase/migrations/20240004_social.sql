-- ── Profil étendu ──────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_color TEXT DEFAULT 'var(--accent)';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS links       JSONB DEFAULT '[]';

-- ── Mur du profil (posts publics sur son propre profil) ─────────────────────
CREATE TABLE IF NOT EXISTS profile_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profile_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_posts_read"   ON profile_posts;
DROP POLICY IF EXISTS "profile_posts_insert" ON profile_posts;
DROP POLICY IF EXISTS "profile_posts_delete" ON profile_posts;
CREATE POLICY "profile_posts_read"   ON profile_posts FOR SELECT USING (true);
CREATE POLICY "profile_posts_insert" ON profile_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profile_posts_delete" ON profile_posts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── Conversations privées ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_read"   ON conversations;
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_read"   ON conversations FOR SELECT TO authenticated USING (user1_id = auth.uid() OR user2_id = auth.uid());
CREATE POLICY "conversations_insert" ON conversations FOR INSERT TO authenticated WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- ── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  read_at         TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_read"   ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_read"   ON messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));
CREATE POLICY "messages_update" ON messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())));

-- ── RPC : créer ou récupérer une conversation ────────────────────────────────
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  me UUID := auth.uid();
  conv_id UUID;
  u1 UUID; u2 UUID;
BEGIN
  IF me = other_user_id THEN RAISE EXCEPTION 'Cannot message yourself'; END IF;
  -- Normalize order so UNIQUE constraint works
  u1 := LEAST(me, other_user_id);
  u2 := GREATEST(me, other_user_id);
  SELECT id INTO conv_id FROM conversations WHERE user1_id = u1 AND user2_id = u2;
  IF conv_id IS NULL THEN
    INSERT INTO conversations(user1_id, user2_id) VALUES (u1, u2) RETURNING id INTO conv_id;
  END IF;
  RETURN conv_id;
END;
$$;

-- ── RPC : compter les messages non lus ──────────────────────────────────────
CREATE OR REPLACE FUNCTION count_unread_messages()
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::integer FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    AND m.sender_id != auth.uid()
    AND m.read_at IS NULL;
$$;
