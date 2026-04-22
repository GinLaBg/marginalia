import { createClient } from "@/lib/supabase";

export type LibraryStatus = "to_read" | "reading" | "read";

export const STATUS_LABELS: Record<LibraryStatus, string> = {
  to_read: "À lire",
  reading: "En cours",
  read:    "Lu",
};

export const STATUS_EMOJI: Record<LibraryStatus, string> = {
  to_read: "🔖",
  reading: "📖",
  read:    "✅",
};

export interface LibraryEntry {
  id: string;
  story_id: string;
  status: LibraryStatus;
  added_at: string;
}

export interface LibraryStory {
  id: string;
  title: string;
  genre: string;
  author_name: string | null;
  cover_url: string | null;
  status: string;
  chapter_count: number;
  views: number | null;
  rating_avg: number | null;
  library_status: LibraryStatus;
  library_added_at: string;
}

// ── Get status of a story in user's library ──────────────────────────────────
export async function getLibraryStatus(storyId: string): Promise<LibraryStatus | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_library")
    .select("status")
    .eq("user_id", user.id)
    .eq("story_id", storyId)
    .maybeSingle();
  return (data?.status as LibraryStatus) ?? null;
}

// ── Add or update a story in library ────────────────────────────────────────
export async function setLibraryStatus(storyId: string, status: LibraryStatus): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from("user_library").upsert({
    user_id: user.id, story_id: storyId, status,
  }, { onConflict: "user_id,story_id" });
  return !error;
}

// ── Remove from library ──────────────────────────────────────────────────────
export async function removeFromLibrary(storyId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_library").delete().eq("user_id", user.id).eq("story_id", storyId);
}

// ── Fetch full library with story details ────────────────────────────────────
export async function fetchLibrary(): Promise<{ to_read: LibraryStory[]; reading: LibraryStory[]; read: LibraryStory[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { to_read: [], reading: [], read: [] };

  const { data } = await supabase
    .from("user_library")
    .select("story_id, status, added_at, stories(id, title, genre, author_name, cover_url, status, chapter_count, views, rating_avg)")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const result: { to_read: LibraryStory[]; reading: LibraryStory[]; read: LibraryStory[] } = {
    to_read: [], reading: [], read: [],
  };

  (data ?? []).forEach((entry: any) => {
    const s = entry.stories;
    if (!s) return;
    const item: LibraryStory = {
      id: s.id, title: s.title, genre: s.genre,
      author_name: s.author_name, cover_url: s.cover_url,
      status: s.status, chapter_count: s.chapter_count,
      views: s.views, rating_avg: s.rating_avg,
      library_status: entry.status, library_added_at: entry.added_at,
    };
    result[entry.status as LibraryStatus]?.push(item);
  });

  return result;
}

// ── Agora subscriptions ──────────────────────────────────────────────────────
export async function fetchAgoraSubscriptions(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("agora_subscriptions").select("categorie").eq("user_id", user.id);
  return (data ?? []).map((r: any) => r.categorie);
}

export async function toggleAgoraSubscription(categorie: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: existing } = await supabase
    .from("agora_subscriptions").select("id").eq("user_id", user.id).eq("categorie", categorie).maybeSingle();
  if (existing) {
    await supabase.from("agora_subscriptions").delete().eq("user_id", user.id).eq("categorie", categorie);
    return false; // now unsubscribed
  } else {
    await supabase.from("agora_subscriptions").insert({ user_id: user.id, categorie });
    return true; // now subscribed
  }
}
