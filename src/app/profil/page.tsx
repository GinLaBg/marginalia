"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Eye, Heart, Star, MessageSquare,
  PenTool, ChevronDown, ChevronUp, Globe, FileText, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GeneratedCover } from "@/components/da/generated-cover";
import { countChapterWords } from "@/lib/ateliers";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────
type StoryRow = {
  id: string; title: string; genre: string;
  author_name: string | null; cover_url: string | null;
  status: string; is_published: boolean;
  views: number; likes_count: number;
  rating_avg: number | null; rating_count: number;
  chapter_count: number; created_at: string;
};

type ChapterRow = {
  id: string; title: string; content: string;
  order: number; is_published: boolean; story_id: string;
  comment_count: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function memberSince(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function Stars({ avg, size = 13 }: { avg: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={cn(
            s <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "fill-transparent text-border"
          )}
        />
      ))}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilPage() {
  const router = useRouter();
  const [user,         setUser]         = useState<User | null>(null);
  const [stories,      setStories]      = useState<StoryRow[]>([]);
  const [chapters,     setChapters]     = useState<Record<string, ChapterRow[]>>({});
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [loadingChaps, setLoadingChaps] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.replace("/auth/login"); return; }
      setUser(u);

      const { data } = await supabase
        .from("stories")
        .select("id, title, genre, author_name, cover_url, status, is_published, views, likes_count, rating_avg, rating_count, chapter_count, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      setStories(data ?? []);
      setLoading(false);
    });
  }, [router]);

  async function toggleExpand(storyId: string) {
    if (expanded === storyId) { setExpanded(null); return; }
    setExpanded(storyId);

    if (chapters[storyId]) return; // already loaded
    setLoadingChaps(storyId);

    const supabase = createClient();
    const [{ data: chaps }, { data: comments }] = await Promise.all([
      supabase.from("chapters").select("id, title, content, order, is_published, story_id").eq("story_id", storyId).order("order"),
      supabase.from("chapter_comments").select("chapter_id").eq("story_id", storyId),
    ]);

    const counts: Record<string, number> = {};
    (comments ?? []).forEach(({ chapter_id }) => { counts[chapter_id] = (counts[chapter_id] ?? 0) + 1; });

    setChapters((prev) => ({
      ...prev,
      [storyId]: (chaps ?? []).map((c) => ({ ...c, comment_count: counts[c.id] ?? 0 })),
    }));
    setLoadingChaps(null);
  }

  // ── Overview stats ──────────────────────────────────────────────────────────
  const published    = stories.filter((s) => s.is_published);
  const totalViews   = stories.reduce((a, s) => a + (s.views ?? 0), 0);
  const totalLikes   = stories.reduce((a, s) => a + (s.likes_count ?? 0), 0);
  const ratedStories = published.filter((s) => s.rating_count > 0);
  const avgRating    = ratedStories.length
    ? ratedStories.reduce((a, s) => a + (s.rating_avg ?? 0), 0) / ratedStories.length
    : null;

  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "Auteur";
  const initials = username.slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* ── Header profil ───────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-2xl font-semibold text-[var(--accent)]">
            {initials}
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <PenTool size={11} />
              Espace auteur
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl">{username}</h1>
            {user?.created_at && (
              <p className="mt-1 text-sm text-muted-foreground">
                Membre depuis {memberSince(user.created_at)}
              </p>
            )}
          </div>
        </div>

        {/* ── Overview stats ───────────────────────────────────────────── */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: BookOpen,   label: "Publiées",   value: published.length,      sub: `${stories.length} au total` },
            { icon: Eye,        label: "Vues",       value: fmt(totalViews),        sub: "toutes histoires" },
            { icon: Heart,      label: "Likes",      value: fmt(totalLikes),        sub: "reçus" },
            { icon: Star,       label: "Note moy.",  value: avgRating ? `${avgRating.toFixed(1)}/5` : "–", sub: ratedStories.length ? `${ratedStories.length} notée${ratedStories.length > 1 ? "s" : ""}` : "pas encore" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-2xl border border-border bg-card px-4 py-4">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                <Icon size={12} />
                {label}
              </div>
              <p className="font-serif text-3xl font-light">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Stories section ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl">Mes histoires</h2>
          <Link
            href="/ateliers"
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            <PenTool size={12} />
            Ateliers
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-20 text-center">
            <p className="font-serif text-2xl mb-3">Aucune histoire</p>
            <p className="text-sm text-muted-foreground">
              Commence à écrire depuis tes{" "}
              <Link href="/ateliers" className="text-[var(--accent)] hover:underline">Ateliers</Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => {
              const isOpen  = expanded === story.id;
              const chaps   = chapters[story.id] ?? [];
              const loading = loadingChaps === story.id;

              const totalWords = chaps.reduce((a, c) => a + countChapterWords(c.content), 0);
              const pubChaps   = chaps.filter((c) => c.is_published).length;

              return (
                <div key={story.id} className="overflow-hidden rounded-2xl border border-border bg-card">

                  {/* Story header row */}
                  <button
                    onClick={() => toggleExpand(story.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/30"
                  >
                    {/* Cover mini */}
                    <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg shadow">
                      {story.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={story.cover_url} alt={story.title} className="h-full w-full object-cover" />
                      ) : (
                        <GeneratedCover title={story.title} author={story.author_name ?? "Auteur"} size="sm" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          story.is_published
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        )}>
                          {story.is_published ? <><Globe size={9} /> Publié</> : <><FileText size={9} /> Brouillon</>}
                        </span>
                        <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {story.genre}
                        </span>
                      </div>
                      <p className="font-serif text-lg leading-tight truncate">{story.title}</p>
                    </div>

                    {/* Stats */}
                    {story.is_published && (
                      <div className="hidden sm:flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye size={13} />{fmt(story.views ?? 0)}</span>
                        <span className="flex items-center gap-1"><Heart size={13} />{fmt(story.likes_count ?? 0)}</span>
                        {(story.rating_avg ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            {(story.rating_avg ?? 0).toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expand icon */}
                    <div className="shrink-0 text-muted-foreground">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded: chapters table */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-5 py-5">

                          {/* Mobile stats (hidden on desktop) */}
                          {story.is_published && (
                            <div className="sm:hidden flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Eye size={13} />{fmt(story.views ?? 0)}</span>
                              <span className="flex items-center gap-1"><Heart size={13} />{fmt(story.likes_count ?? 0)}</span>
                              {(story.rating_avg ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-amber-500 font-medium">
                                  <Star size={13} className="fill-amber-400" />
                                  {(story.rating_avg ?? 0).toFixed(1)}/5
                                  <span className="text-muted-foreground font-normal text-xs">({story.rating_count} avis)</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Desktop rating detail */}
                          {story.is_published && (story.rating_avg ?? 0) > 0 && (
                            <div className="hidden sm:flex items-center gap-3 mb-4">
                              <Stars avg={story.rating_avg ?? 0} size={15} />
                              <span className="text-sm font-medium">{(story.rating_avg ?? 0).toFixed(1)}/5</span>
                              <span className="text-xs text-muted-foreground">{story.rating_count} avis</span>
                            </div>
                          )}

                          {/* Stats résumé */}
                          {chaps.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5"><TrendingUp size={12} />{fmt(totalWords)} mots écrits</span>
                              <span className="flex items-center gap-1.5"><BookOpen size={12} />{pubChaps}/{chaps.length} chapitres publiés</span>
                            </div>
                          )}

                          {/* Chapters table */}
                          {loading ? (
                            <div className="space-y-2">
                              {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-muted/40" />)}
                            </div>
                          ) : chaps.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun chapitre.</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                    <th className="pb-2 pr-4 text-left font-medium w-8">#</th>
                                    <th className="pb-2 pr-4 text-left font-medium">Titre</th>
                                    <th className="pb-2 pr-4 text-right font-medium whitespace-nowrap">Mots</th>
                                    <th className="pb-2 pr-4 text-center font-medium">Statut</th>
                                    <th className="pb-2 text-right font-medium">Commentaires</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {chaps.map((ch, i) => (
                                    <tr key={ch.id} className="group">
                                      <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                                      <td className="py-3 pr-4">
                                        <Link
                                          href={`/ateliers/${story.id}`}
                                          className="font-medium hover:text-[var(--accent)] transition-colors"
                                        >
                                          {ch.title || `Chapitre ${i + 1}`}
                                        </Link>
                                      </td>
                                      <td className="py-3 pr-4 text-right text-muted-foreground tabular-nums">
                                        {countChapterWords(ch.content).toLocaleString("fr-FR")}
                                      </td>
                                      <td className="py-3 pr-4 text-center">
                                        {ch.is_published ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
                                            <Globe size={9} /> Publié
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                                            <FileText size={9} /> Brouillon
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3 text-right">
                                        {ch.is_published ? (
                                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                                            <MessageSquare size={12} />
                                            {ch.comment_count}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground opacity-30">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Action link */}
                          <div className="mt-4 flex items-center gap-3">
                            <Link
                              href={`/ateliers/${story.id}`}
                              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                            >
                              <PenTool size={11} />
                              Ouvrir dans l&apos;atelier
                            </Link>
                            {story.is_published && (
                              <Link
                                href={`/lire/${story.id}`}
                                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                              >
                                <BookOpen size={11} />
                                Voir la page publique
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
