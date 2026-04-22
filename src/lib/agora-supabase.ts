import { createClient } from "@/lib/supabase";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export type AgoraCategorie =
  | "Général"
  | "Théories & Analyses"
  | "Recommandations"
  | "Écriture"
  | "Débats"
  | "Communauté";

export interface AgoraTopic {
  id: string;
  titre: string;
  contenu: string;
  categorie: AgoraCategorie;
  auteur_id: string;
  auteur_username: string;
  vues: number;
  nb_reponses: number;
  likes_count: number;
  epingle: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgoraReply {
  id: string;
  topic_id: string;
  contenu: string;
  auteur_id: string;
  auteur_username: string;
  created_at: string;
}

/* ─── Topics ────────────────────────────────────────────────────────────────── */

export async function fetchTopics(): Promise<AgoraTopic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agora_topics")
    .select("*")
    .order("epingle", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) { console.error("[fetchTopics]", error); return []; }
  return (data ?? []) as AgoraTopic[];
}

export async function fetchTopicById(id: string): Promise<AgoraTopic | null> {
  const supabase = createClient();

  // Incrémenter les vues
  await supabase.rpc("increment_topic_views", { topic_id: id });

  const { data, error } = await supabase
    .from("agora_topics")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as AgoraTopic;
}

export async function createTopic(params: {
  titre: string;
  contenu: string;
  categorie: AgoraCategorie;
}): Promise<{ id: string } | { error: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const username =
    user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Anonyme";

  const { data, error } = await supabase
    .from("agora_topics")
    .insert({
      titre: params.titre,
      contenu: params.contenu,
      categorie: params.categorie,
      auteur_id: user.id,
      auteur_username: username,
    })
    .select("id")
    .single();

  if (error) { console.error("[createTopic]", error); return { error: error.message }; }
  return { id: data.id };
}

/* ─── Replies ───────────────────────────────────────────────────────────────── */

export async function fetchReplies(topicId: string): Promise<AgoraReply[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agora_replies")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error) { console.error("[fetchReplies]", error); return []; }
  return (data ?? []) as AgoraReply[];
}

export async function createReply(params: {
  topicId: string;
  contenu: string;
}): Promise<AgoraReply | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const username =
    user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Anonyme";

  const { data, error } = await supabase
    .from("agora_replies")
    .insert({
      topic_id: params.topicId,
      contenu: params.contenu,
      auteur_id: user.id,
      auteur_username: username,
    })
    .select()
    .single();

  if (error) { console.error("[createReply]", error); return null; }

  // Mettre à jour nb_reponses + updated_at du topic
  await supabase.rpc("increment_topic_replies", { topic_id: params.topicId });

  return data as AgoraReply;
}
