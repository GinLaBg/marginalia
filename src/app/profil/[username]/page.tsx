"use client";

import { useEffect, useState, use, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, UserCheck, MessageCircle, ExternalLink, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  fetchProfileByUsername, getFollowCounts, fetchWallPosts, createWallPost,
  deleteWallPost, fetchUserAgoraTopics, getOrCreateConversation,
  type Profile, type ProfilePost,
} from "@/lib/profile-supabase";
import { FollowButton } from "@/components/follow-button";
import { createClient } from "@/lib/supabase";

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); }
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "à l'instant";
  if (d < 3600) return `il y a ${Math.floor(d / 60)}min`;
  if (d < 86400) return `il y a ${Math.floor(d / 3600)}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const AGORA_COLORS: Record<string, string> = {
  "Général": "text-muted-foreground", "Théories & Analyses": "text-violet-400",
  "Recommandations": "text-emerald-400", "Écriture": "text-sky-400",
  "Débats": "text-rose-400", "Communauté": "text-amber-400",
};

type Tab = "journal" | "agora" | "apropos";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params);
  const username = decodeURIComponent(rawUsername);
  const router = useRouter();

  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [counts,    setCounts]    = useState({ followers: 0, following: 0 });
  const [posts,     setPosts]     = useState<ProfilePost[]>([]);
  const [topics,    setTopics]    = useState<any[]>([]);
  const [tab,       setTab]       = useState<Tab>("journal");
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [myId,      setMyId]      = useState<string | null>(null);
  const [postDraft, setPostDraft] = useState("");
  const [posting,   setPosting]   = useState(false);
  const [messaging, setMessaging] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    async function load() {
      const p = await fetchProfileByUsername(username);
      if (!p) { setNotFound(true); setLoading(false); return; }
      setProfile(p);
      const [fc, wall, agora] = await Promise.all([
        getFollowCounts(p.id),
        fetchWallPosts(p.id),
        fetchUserAgoraTopics(p.id),
      ]);
      setCounts(fc);
      setPosts(wall);
      setTopics(agora);
      setLoading(false);
    }
    load();
  }, [username]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!postDraft.trim() || posting) return;
    setPosting(true);
    const post = await createWallPost(postDraft.trim());
    if (post) setPosts((prev) => [post, ...prev]);
    setPostDraft("");
    setPosting(false);
  }

  async function handleDelete(id: string) {
    await deleteWallPost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleMessage() {
    if (!profile || messaging) return;
    setMessaging(true);
    const convId = await getOrCreateConversation(profile.id);
    if (convId) router.push(`/messages/${convId}`);
    setMessaging(false);
  }

  if (loading) return (
    <div className="animate-pulse">
      <div className="h-40 bg-muted/30" />
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <div className="flex gap-4 items-end -mt-12">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="space-y-2 pb-2">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-60 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-2xl">Profil introuvable</p>
      <p className="text-sm text-muted-foreground">L&apos;utilisateur @{username} n&apos;existe pas.</p>
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">Retour à l&apos;accueil</Link>
    </div>
  );
  if (!profile) return null;

  const isOwn = myId === profile.id;
  const bannerColor = profile.banner_color || "var(--accent)";
  const initials = profile.username.slice(0, 2).toUpperCase();
  const links: { label: string; url: string }[] = Array.isArray(profile.links) ? profile.links : [];

  return (
    <div className="min-h-screen">
      {/* ── Bannière ── */}
      <div
        className="h-40 sm:h-52 w-full"
        style={{ background: `linear-gradient(135deg, ${bannerColor}66 0%, ${bannerColor}22 100%)` }}
      />

      {/* ── Hero ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
          {/* Avatar */}
          <div className="flex items-end gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.username}
                className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-lg shrink-0" />
            ) : (
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-background shadow-lg text-2xl font-semibold"
                style={{ background: `linear-gradient(135deg, ${bannerColor}44, ${bannerColor}88)`, color: bannerColor }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isOwn && (
            <div className="flex items-center gap-2 pb-1">
              <FollowButton targetUserId={profile.id} targetUsername={profile.username} />
              <button
                onClick={handleMessage}
                disabled={!myId || messaging}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-40"
              >
                <MessageCircle size={14} />
                Message
              </button>
            </div>
          )}
          {isOwn && (
            <Link href="/profil/parametres"
              className="pb-1 text-xs text-muted-foreground underline-offset-2 hover:underline">
              Modifier le profil
            </Link>
          )}
        </div>

        {/* Name + bio */}
        <div className="mt-4">
          <h1 className="font-serif text-2xl sm:text-3xl">@{profile.username}</h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={11} /> Membre depuis {formatDate(profile.created_at)}
          </p>
          {profile.bio && <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-lg">{profile.bio}</p>}

          {/* Links */}
          {links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
                  <ExternalLink size={11} />{l.label}
                </a>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-muted-foreground" />
              <span className="font-medium">{fmt(counts.followers)}</span>
              <span className="text-muted-foreground">abonné{counts.followers !== 1 ? "s" : ""}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-muted-foreground" />
              <span className="font-medium">{fmt(counts.following)}</span>
              <span className="text-muted-foreground">abonnements</span>
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-0">
            {(["journal", "agora", "apropos"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                  tab === t
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "journal" ? "Journal" : t === "agora" ? "Agora" : "À propos"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="py-8">

          {/* JOURNAL */}
          {tab === "journal" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Post form — only for owner */}
              {isOwn && (
                <form onSubmit={handlePost} className="mb-8">
                  <div className="rounded-2xl border border-border bg-card/50 p-4">
                    <textarea
                      ref={textRef}
                      value={postDraft}
                      onChange={(e) => setPostDraft(e.target.value)}
                      placeholder="Partage une pensée, une mise à jour, une humeur…"
                      rows={3}
                      maxLength={1000}
                      className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{postDraft.length}/1000</span>
                      <button type="submit" disabled={!postDraft.trim() || posting}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-[var(--accent)]/90 disabled:opacity-50">
                        <Send size={12} /> Publier
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Posts list */}
              {posts.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  {isOwn ? "Écris ton premier post pour remplir ton journal." : "Pas encore de posts."}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <motion.article key={post.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-2xl border border-border bg-card/40 px-5 py-4"
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                      {isOwn && (
                        <button onClick={() => handleDelete(post.id)}
                          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* AGORA */}
          {tab === "agora" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {topics.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Pas encore de sujets Agora.
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <Link key={topic.id} href={`/agora/${topic.id}`}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card/40 px-5 py-4 transition-all hover:border-[var(--accent)]/30 hover:-translate-y-0.5">
                      <div className="min-w-0">
                        <span className={cn("text-[10px] uppercase tracking-widest font-medium", AGORA_COLORS[topic.categorie] ?? "text-muted-foreground")}>
                          {topic.categorie}
                        </span>
                        <p className="mt-0.5 font-medium text-sm group-hover:text-[var(--accent)] transition-colors line-clamp-2">{topic.titre}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{timeAgo(topic.created_at)}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{topic.vues} vues</span>
                        <span>{topic.nb_reponses} rép.</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* À PROPOS */}
          {tab === "apropos" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="space-y-6 max-w-lg">
              {profile.bio ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Biographie</p>
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{isOwn ? "Ajoute une bio depuis tes paramètres." : "Pas de biographie."}</p>
              )}
              {links.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Liens</p>
                  <div className="space-y-2">
                    {links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline">
                        <ExternalLink size={13} />{l.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Statistiques</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Abonnés", value: fmt(counts.followers) },
                    { label: "Abonnements", value: fmt(counts.following) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-serif text-2xl mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {isOwn && (
                <Link href="/profil/parametres"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Modifier le profil
                </Link>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
