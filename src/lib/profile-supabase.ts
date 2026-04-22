import { createClient } from "@/lib/supabase";

export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_color: string | null;
  links: { label: string; url: string }[];
  created_at: string;
}

export interface UserPreferences {
  show_drafts: boolean;
  show_ongoing: boolean;
  show_finished: boolean;
  show_agora_activity: boolean;
  featured_stories: string[];
}

export interface ProfilePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  other_username: string;
  last_message?: string;
  unread?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = createClient();
  // Cherche d'abord par username exact, puis par full_name si pas trouvé
  const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (data) return data;
  const { data: data2 } = await supabase.from("profiles").select("*").ilike("full_name", username).maybeSingle();
  return data2 ?? null;
}

export async function fetchMyProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data ?? null;
}

export async function upsertProfile(updates: {
  bio?: string;
  avatar_url?: string;
  username?: string;
  banner_color?: string;
  links?: { label: string; url: string }[];
}): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const username = updates.username ?? user.user_metadata?.username ?? user.email?.split("@")[0] ?? "user";
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    ...updates,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

// ── Stories ───────────────────────────────────────────────────────────────────

export async function fetchStoriesForProfile(userId: string, prefs: UserPreferences) {
  const supabase = createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, title, genre, cover_url, status, is_published, views, likes_count, rating_avg, rating_count, chapter_count, author_name")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (!data) return [];
  return data.filter((s) => {
    if (!s.is_published && !prefs.show_drafts) return false;
    if (s.status === "drafting" && !prefs.show_drafts) return false;
    if (s.status === "ongoing" && !prefs.show_ongoing) return false;
    if (s.status === "finished" && !prefs.show_finished) return false;
    return true;
  });
}

// ── Preferences ───────────────────────────────────────────────────────────────

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const supabase = createClient();
  const { data } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single();
  return data ?? { show_drafts: false, show_ongoing: true, show_finished: true, show_agora_activity: true, featured_stories: [] };
}

export async function savePreferences(prefs: UserPreferences): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from("user_preferences").upsert({ user_id: user.id, ...prefs, updated_at: new Date().toISOString() });
  return !error;
}

// ── Follows ───────────────────────────────────────────────────────────────────

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const supabase = createClient();
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase.from("user_follows").select("follower_id").eq("follower_id", followerId).eq("following_id", followingId).maybeSingle();
  return !!data;
}

export async function follow(followingId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === followingId) return;
  await supabase.from("user_follows").insert({ follower_id: user.id, following_id: followingId });
  const username = user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Quelqu'un";
  await supabase.from("notifications").insert({
    user_id: followingId, type: "follow", source_user_id: user.id,
    source_username: username, content_url: `/profil/${encodeURIComponent(username)}`,
    message: `${username} s'est abonné(e) à ton profil.`,
  });
}

export async function unfollow(followingId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", followingId);
}

// ── Wall posts ────────────────────────────────────────────────────────────────

export async function fetchWallPosts(userId: string): Promise<ProfilePost[]> {
  const supabase = createClient();
  const { data } = await supabase.from("profile_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data ?? []) as ProfilePost[];
}

export async function createWallPost(content: string): Promise<ProfilePost | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profile_posts").insert({ user_id: user.id, content }).select().single();
  return data ?? null;
}

export async function deleteWallPost(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("profile_posts").delete().eq("id", id);
}

// ── Agora activity ────────────────────────────────────────────────────────────

export async function fetchUserAgoraTopics(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("agora_topics")
    .select("id, titre, categorie, vues, nb_reponses, created_at")
    .eq("auteur_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

// ── Conversations / DM ────────────────────────────────────────────────────────

export async function getOrCreateConversation(otherUserId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_or_create_conversation", { other_user_id: otherUserId });
  if (error) { console.error(error); return null; }
  return data as string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("conversations")
    .select("*, messages(content, created_at, sender_id, read_at)")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (!data) return [];

  // Fetch other user usernames
  const otherIds = data.map((c: any) => c.user1_id === user.id ? c.user2_id : c.user1_id);
  const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", otherIds);
  const profileMap: Record<string, string> = {};
  (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p.username; });

  return data.map((c: any) => {
    const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
    const msgs: any[] = c.messages ?? [];
    const last = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const unread = msgs.filter((m: any) => m.sender_id !== user.id && !m.read_at).length;
    return {
      id: c.id,
      user1_id: c.user1_id,
      user2_id: c.user2_id,
      last_message_at: c.last_message_at,
      other_username: profileMap[otherId] ?? "?",
      last_message: last?.content,
      unread,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

export async function sendMessage(conversationId: string, content: string): Promise<Message | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, content }).select().single();
  // Update last_message_at
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  return data ?? null;
}

export async function markMessagesRead(conversationId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

export async function countUnreadMessages(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase.rpc("count_unread_messages");
  return data ?? 0;
}
