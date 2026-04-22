"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, Send, MessageSquare, Eye, User, Trash2, Heart, CornerDownRight } from "lucide-react";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchTopicById,
  fetchReplies,
  createReply,
  type AgoraTopic,
  type AgoraReply,
  type AgoraCategorie,
} from "@/lib/agora-supabase";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { FollowButton } from "@/components/follow-button";
import { fetchProfileByUsername } from "@/lib/profile-supabase";
import { ReportButton } from "@/components/report-button";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const categorieColors: Record<AgoraCategorie, string> = {
  "Général":             "text-muted-foreground border-border",
  "Théories & Analyses": "text-violet-400 border-violet-400/40",
  "Recommandations":     "text-emerald-400 border-emerald-400/40",
  "Écriture":            "text-sky-400 border-sky-400/40",
  "Débats":              "text-rose-400 border-rose-400/40",
  "Communauté":          "text-amber-400 border-amber-400/40",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "à l'instant";
  if (m < 60)  return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */

function Avatar({ username, size = 8 }: { username: string; size?: number }) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shrink-0 font-medium text-xs",
        `h-${size} w-${size}`
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/* ─── Reply card ─────────────────────────────────────────────────────────── */

function ReplyCard({
  reply, index, currentUserId, userRole, onDelete, onReply,
}: {
  reply: AgoraReply;
  index: number;
  currentUserId?: string;
  userRole?: string;
  onDelete?: (id: string) => void;
  onReply?: (username: string) => void;
}) {
  const isOwn     = currentUserId === reply.auteur_id;
  const isAdmin   = ["admin", "super_admin", "moderator"].includes(userRole ?? "");
  const canDelete = isOwn || isAdmin;

  // Like state from localStorage
  const storageKey = "marginalia-reply-liked";
  const [liked,     setLiked]     = useState(() => {
    if (typeof window === "undefined") return false;
    const stored: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return stored.includes(reply.id);
  });
  const [likes,     setLikes]     = useState((reply as any).likes_count ?? 0);
  const [likeBusy,  setLikeBusy]  = useState(false);

  async function toggleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const delta = liked ? -1 : 1;
    setLiked(!liked);
    setLikes((n: number) => n + delta);
    const stored: string[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    const updated = liked ? stored.filter((id) => id !== reply.id) : [...stored, reply.id];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    await createClient().rpc("toggle_reply_like", { rid: reply.id, delta });
    setLikeBusy(false);
  }

  return (
    <motion.div variants={fadeUp} className="group flex gap-3 sm:gap-4">
      <Avatar username={reply.auteur_username} size={8} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium">{reply.auteur_username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(reply.created_at)}</span>
          <span className="ml-auto text-xs text-muted-foreground/50">#{index + 1}</span>
          {/* Actions */}
          <div className="flex items-center gap-1 ml-1">
            {currentUserId && !isOwn && !isAdmin && (
              <ReportButton contentType="reply" contentId={reply.id} compact />
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(reply.id)}
                className="text-muted-foreground/40 transition-all hover:text-red-500 opacity-0 group-hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.contenu}</p>
        </div>

        {/* Like + Répondre */}
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={toggleLike}
            disabled={likeBusy}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all",
              liked
                ? "text-rose-500 bg-rose-500/10"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
            )}
          >
            <Heart size={12} className={liked ? "fill-rose-500" : ""} />
            {likes > 0 && <span>{likes}</span>}
          </button>

          {currentUserId && onReply && (
            <button
              onClick={() => onReply(reply.auteur_username)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-all hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
            >
              <CornerDownRight size={12} /> Répondre
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function ReplySkeletons() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-24 bg-muted rounded mb-2" />
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const router = useRouter();

  const [topic,        setTopic]        = useState<AgoraTopic | null>(null);
  const [replies,      setReplies]      = useState<AgoraReply[]>([]);
  const [user,         setUser]         = useState<SupabaseUser | null>(null);
  const [userRole,     setUserRole]     = useState<string>("user");
  const [authorId,     setAuthorId]     = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [reply,        setReply]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [replyError,   setReplyError]   = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleReplyTo(username: string) {
    setReply(`@${username} `);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function deleteReply(replyId: string) {
    const isAdmin = ["admin", "super_admin", "moderator"].includes(userRole);
    if (isAdmin) {
      await createClient().rpc("admin_delete_content", { p_content_type: "reply", p_content_id: replyId });
    } else {
      await createClient().from("agora_replies").delete().eq("id", replyId);
    }
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    if (topic) setTopic({ ...topic, nb_reponses: Math.max(0, topic.nb_reponses - 1) });
  }

  async function deleteTopic() {
    if (!topic) return;
    if (!confirm("Supprimer ce sujet définitivement ? Toutes les réponses seront perdues.")) return;
    const isAdmin = ["admin", "super_admin", "moderator"].includes(userRole);
    if (isAdmin) {
      await createClient().rpc("admin_delete_content", { p_content_type: "topic", p_content_id: topic.id });
    } else {
      await createClient().from("agora_topics").delete().eq("id", topic.id);
    }
    router.push("/agora");
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles").select("role").eq("id", data.user.id).single();
        if (profile) setUserRole(profile.role);
      }
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [t, r] = await Promise.all([fetchTopicById(topicId), fetchReplies(topicId)]);
    if (!t) { router.push("/agora"); return; }
    setTopic(t);
    setReplies(r);
    // Fetch author profile id
    fetchProfileByUsername(t.auteur_username).then((p) => { if (p) setAuthorId(p.id); });
    setLoading(false);
  }, [topicId, router]);

  useEffect(() => { load(); }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    if (!user) { router.push("/auth/login"); return; }

    setSending(true);
    setReplyError("");
    const newReply = await createReply({ topicId, contenu: reply.trim() });
    if (newReply) {
      setReplies((prev) => [...prev, newReply]);
      setReply("");
      if (topic) setTopic({ ...topic, nb_reponses: topic.nb_reponses + 1 });
    } else {
      setReplyError("Erreur lors de l'envoi. Réessaie.");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 space-y-6 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-8 w-3/4 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
        <ReplySkeletons />
      </div>
    );
  }

  if (!topic) return null;

  const colors = categorieColors[topic.categorie];

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 50% 30% at 20% 0%, color-mix(in srgb, var(--accent) 6%, transparent), transparent)" }}
      />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        {/* ── Back ────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Link
            href="/agora"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Agora
          </Link>
        </motion.div>

        {/* ── Topic ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          {/* Badge + méta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {topic.epingle && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">Épinglé</span>
            )}
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border font-normal", colors)}>
              {topic.categorie}
            </Badge>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl leading-snug mb-4">{topic.titre}</h1>

          {/* Auteur + stats */}
          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-muted-foreground">
            <Avatar username={topic.auteur_username} size={7} />
            <Link href={`/profil/${encodeURIComponent(topic.auteur_username)}`} className="font-medium text-foreground/80 hover:text-[var(--accent)] transition-colors">
              {topic.auteur_username}
            </Link>
            {authorId && user?.id !== topic.auteur_id && (
              <FollowButton targetUserId={authorId} targetUsername={topic.auteur_username} compact />
            )}
            <span className="ml-auto">·</span>
            <span>{formatDate(topic.created_at)}</span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {topic.nb_reponses}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {topic.vues}
            </span>
          </div>

          {/* Corps */}
          <div className="rounded-xl border border-[var(--accent)]/20 bg-card/40 px-5 py-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{topic.contenu}</p>
          </div>

          {/* Actions topic : signaler ou supprimer */}
          {user && (
            <div className="mt-4 flex justify-end gap-2">
              {user.id !== topic.auteur_id && !["admin","super_admin","moderator"].includes(userRole) && (
                <ReportButton contentType="topic" contentId={topic.id} compact={false} />
              )}
              {(user.id === topic.auteur_id || ["admin","super_admin","moderator"].includes(userRole)) && (
                <button
                  onClick={deleteTopic}
                  className="flex items-center gap-1.5 rounded-xl border border-red-400/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                >
                  <Trash2 size={13} /> Supprimer le sujet
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Réponses ────────────────────────────────────────────────────── */}
        {replies.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">
              {replies.length} réponse{replies.length > 1 ? "s" : ""}
            </p>
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
              {replies.map((r, i) => (
                <ReplyCard key={r.id} reply={r} index={i} currentUserId={user?.id} userRole={userRole} onDelete={deleteReply} onReply={handleReplyTo} />
              ))}
            </motion.div>
          </div>
        )}

        {/* ── Formulaire réponse ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border-t border-border/40 pt-8"
        >
          {user ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Répondre</p>
              <form onSubmit={handleReply} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar username={user.user_metadata?.username ?? user.email?.split("@")[0] ?? "?"} size={8} />
                  <textarea
                    ref={textareaRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Écris ta réponse…"
                    rows={4}
                    maxLength={3000}
                    className="flex-1 rounded-xl border border-border/60 bg-card/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all resize-none leading-relaxed"
                  />
                </div>
                {replyError && (
                  <p className="text-sm text-destructive">{replyError}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent gap-1.5"
                    size="sm"
                  >
                    {sending ? "Envoi…" : <><Send size={13} /> Répondre</>}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Connecte-toi pour participer à la discussion.
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)] text-[var(--accent)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors"
                >
                  <User size={14} /> Se connecter
                </Link>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
