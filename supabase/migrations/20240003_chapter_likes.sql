-- Add likes_count to chapters
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- RPC: toggle chapter like (increment or decrement)
CREATE OR REPLACE FUNCTION toggle_chapter_like(cid UUID, delta INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE chapters
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + delta)
  WHERE id = cid;
END;
$$;
