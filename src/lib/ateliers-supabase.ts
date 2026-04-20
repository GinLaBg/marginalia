import { createClient } from "@/lib/supabase";
import type { WorkshopBook, WorkshopChapter, WorkshopCharacter } from "@/lib/ateliers";

// ─── Stories ────────────────────────────────────────────────────────────────

export async function fetchUserStories(): Promise<WorkshopBook[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!stories) return [];

  return stories.map(dbStoryToWorkshop);
}

export async function fetchStoryById(id: string): Promise<WorkshopBook | null> {
  const supabase = createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (!story) return null;

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", id)
    .order("order", { ascending: true });

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("story_id", id);

  return {
    ...dbStoryToWorkshop(story),
    chapters: chapters?.map(dbChapterToWorkshop) ?? [{ id: "ch-1", title: "Chapitre 1", content: "" }],
    characters: characters?.map(dbCharacterToWorkshop) ?? [],
  };
}

export async function createStory(data: {
  title: string;
  genre: string;
  status: string;
  synopsis?: string;
  coverUrl?: string;
  authorName?: string;
  ambition?: string;
  tone?: string;
  audience?: string;
  universeNote?: string;
  chapterCount?: number;
}): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: story, error } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      title: data.title,
      genre: data.genre,
      status: data.status,
      description: data.synopsis ?? "",
      cover_url: data.coverUrl ?? null,
      author_name: data.authorName ?? null,
      ambition: data.ambition ?? null,
      tone: data.tone ?? null,
      audience: data.audience ?? null,
      universe_note: data.universeNote ?? null,
      chapter_count: data.chapterCount ?? 0,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !story) return null;

  // Créer le premier chapitre
  await supabase.from("chapters").insert({
    story_id: story.id,
    title: "Chapitre 1",
    content: "",
    order: 1,
  });

  return story.id;
}

export async function deleteStory(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("chapters").delete().eq("story_id", id);
  await supabase.from("characters").delete().eq("story_id", id);
  await supabase.from("stories").delete().eq("id", id);
}

// ─── Chapters ───────────────────────────────────────────────────────────────

export async function saveChapterContent(chapterId: string, content: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("chapters").update({ content }).eq("id", chapterId);
}

export async function addChapter(storyId: string, title: string, order: number): Promise<WorkshopChapter | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("chapters")
    .insert({ story_id: storyId, title, content: "", order })
    .select()
    .single();

  if (!data) return null;
  return dbChapterToWorkshop(data);
}

export async function deleteChapter(chapterId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("chapters").delete().eq("id", chapterId);
}

// ─── Characters ─────────────────────────────────────────────────────────────

export async function addCharacter(storyId: string, data: { name: string; role: string; notes: string }): Promise<WorkshopCharacter | null> {
  const supabase = createClient();
  const { data: character } = await supabase
    .from("characters")
    .insert({ story_id: storyId, name: data.name, role: data.role, description: data.notes })
    .select()
    .single();

  if (!character) return null;
  return dbCharacterToWorkshop(character);
}

export async function updateCharacter(characterId: string, data: { name: string; role: string; notes: string }): Promise<void> {
  const supabase = createClient();
  await supabase.from("characters").update({ name: data.name, role: data.role, description: data.notes }).eq("id", characterId);
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("characters").delete().eq("id", characterId);
}

// ─── Cover upload ────────────────────────────────────────────────────────────

export async function uploadCover(file: File, storyId: string): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${storyId}/cover.${ext}`;

  const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
  if (error) return null;

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateStory(id: string, data: {
  title: string; genre: string; status: string; synopsis?: string;
  coverUrl?: string; authorName?: string; ambition?: string;
  tone?: string; audience?: string; universeNote?: string;
}): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("stories")
    .update({
      title: data.title,
      genre: data.genre,
      status: data.status,
      description: data.synopsis ?? "",
      cover_url: data.coverUrl !== undefined ? data.coverUrl : undefined,
      author_name: data.authorName ?? null,
      ambition: data.ambition ?? null,
      tone: data.tone ?? null,
      audience: data.audience ?? null,
      universe_note: data.universeNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("[updateStory] error:", error);
  return !error;
}

export async function updateStoryStatus(id: string, status: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("stories").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbStoryToWorkshop(s: any): WorkshopBook {
  return {
    id: s.id,
    title: s.title,
    genre: s.genre ?? "",
    status: s.status ?? "drafting",
    coverImage: s.cover_url ?? undefined,
    synopsis: s.description ?? undefined,
    chapterCount: s.chapter_count ?? 0,
    updatedAt: s.updated_at ?? s.created_at ?? new Date().toISOString(),
    authorName: s.author_name ?? undefined,
    ambition: s.ambition ?? undefined,
    tone: s.tone ?? undefined,
    audience: s.audience ?? undefined,
    universeNote: s.universe_note ?? undefined,
    coverSeed: `${s.title}::${s.author_name ?? "atelier"}`,
    isPublished: s.is_published ?? false,
    chapters: [],
    characters: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbChapterToWorkshop(c: any): WorkshopChapter {
  return { id: c.id, title: c.title, content: c.content ?? "", is_published: c.is_published ?? false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbCharacterToWorkshop(c: any): WorkshopCharacter {
  return { id: c.id, name: c.name, role: c.role ?? "", notes: c.description ?? "" };
}
