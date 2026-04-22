"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Eye, Heart, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GeneratedCover } from "@/components/da/generated-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FollowButton } from "@/components/follow-button";
import { fetchProfileByUsername } from "@/lib/profile-supabase";
import { LibraryButton } from "@/components/library-button";

type Story = {
  id: string; title: string; genre: string; author_name: string | null;
  author_username: string | null;
  description: string | null; cover_url: string | null; status: string;
  ambition: string | null; tone: string | null; audience: string | null;
  views: number | null; likes_count: number | null;
  rating_avg: number | null; rating_count: number | null;
};

type Chapter = { id: string; title: string; order: number; published_at: string; views_count: number; comment_count: number };

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [story,    setStory]    = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [liked,       setLiked]      = useState(false);
  const [likeBusy,    setLikeBusy]   = useState(false);
  const [authorId,    setAuthorId]   = useState<string | null>(null);
  const [userRating,  setUserRating] = useState(0);   // 0 = not rated
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingBusy,  setRatingBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("stories").select("*").eq("id", storyId).eq("is_published", true).single(),
      supabase.from("chapters").select("id, title, order, published_at, views_count").eq("story_id", storyId).eq("is_published", true).order("order", { ascending: true }),
      supabase.from("chapter_comments").select("chapter_id").eq("story_id", storyId),
    ]).then(([{ data: s }, { data: c }, { data: comments }]) => {
      setStory(s);
      // Agréger les commentaires par chapitre
      const counts: Record<string, number> = {};
      (comments ?? []).forEach(({ chapter_id }) => {
        counts[chapter_id] = (counts[chapter_id] ?? 0) + 1;
      });
      setChapters((c ?? []).map((ch) => ({ ...ch, views_count: ch.views_count ?? 0, comment_count: counts[ch.id] ?? 0 })));
      if (s?.author_name) fetchProfileByUsername(s.author_name).then((p) => { if (p) setAuthorId(p.id); });
      setLoading(false);
    });

    // Incrémenter les vues à chaque visite
    supabase.rpc("increment_story_views", { sid: storyId });

    // Restore like state from localStorage
    const likedStories: string[] = JSON.parse(localStorage.getItem("marginalia-liked") ?? "[]");
    setLiked(likedStories.includes(storyId));

    // Restore rating
    const ratings: Record<string, number> = JSON.parse(localStorage.getItem("marginalia-ratings") ?? "{}");
    setUserRating(ratings[storyId] ?? 0);
  }, [storyId]);

  async function toggleLike() {
    if (!story || likeBusy) return;
    setLikeBusy(true);
    const delta = liked ? -1 : 1;

    // Optimistic update
    setLiked(!liked);
    setStory((s) => s ? { ...s, likes_count: (s.likes_count ?? 0) + delta } : s);

    // Persist in localStorage
    const likedStories: string[] = JSON.parse(localStorage.getItem("marginalia-liked") ?? "[]");
    const updated = liked
      ? likedStories.filter((id) => id !== storyId)
      : [...likedStories, storyId];
    localStorage.setItem("marginalia-liked", JSON.stringify(updated));

    // Update DB
    await createClient().rpc("toggle_story_like", { sid: storyId, delta });
    setLikeBusy(false);
  }

  async function submitRating(stars: number) {
    if (!story || ratingBusy) return;
    setRatingBusy(true);

    // Get or create anonymous user key
    let userKey = localStorage.getItem("marginalia-user-key");
    if (!userKey) {
      userKey = crypto.randomUUID();
      localStorage.setItem("marginalia-user-key", userKey);
    }

    const isReratingWithSame = userRating === stars;
    const wasAlreadyRated    = userRating > 0;
    const prevRating         = userRating;
    const prevCount          = story.rating_count ?? 0;
    const prevAvg            = story.rating_avg ?? 0;

    // Optimistic update
    setUserRating(stars);
    const ratings: Record<string, number> = JSON.parse(localStorage.getItem("marginalia-ratings") ?? "{}");
    ratings[storyId] = stars;
    localStorage.setItem("marginalia-ratings", JSON.stringify(ratings));

    // Optimistic avg recalc
    let newCount = wasAlreadyRated ? prevCount : prevCount + 1;
    let newAvg   = wasAlreadyRated
      ? (prevAvg * prevCount - prevRating + stars) / prevCount
      : (prevAvg * prevCount + stars) / newCount;
    setStory((s) => s ? { ...s, rating_avg: +newAvg.toFixed(2), rating_count: newCount } : s);

    // DB upsert
    await createClient().rpc("upsert_story_rating", { sid: storyId, ukey: userKey, stars });

    // Refetch accurate values
    const { data } = await createClient().from("stories").select("rating_avg, rating_count").eq("id", storyId).single();
    if (data) setStory((s) => s ? { ...s, rating_avg: data.rating_avg, rating_count: data.rating_count } : s);
    setRatingBusy(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Chargement...</p></div>;
  if (!story)  return <div className="flex min-h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Histoire introuvable.</p></div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>

        <Link href="/lire" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-8 gap-1.5")}>
          <ArrowLeft size={14} />
          Retour
        </Link>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="w-40 shrink-0 overflow-hidden rounded-2xl shadow-xl">
            {story.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.cover_url} alt={story.title} className="aspect-[2/3] w-full object-cover" />
            ) : (
              <GeneratedCover title={story.title} author={story.author_name ?? "Auteur"} size="md" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">{story.genre}</span>
              {story.ambition  && <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">{story.ambition}</span>}
              {story.tone      && <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">{story.tone}</span>}
              {story.audience  && <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">{story.audience}</span>}
              {chapters.length === 1 && (
                <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                  One-shot
                </span>
              )}
              <span className={cn("rounded-full border px-3 py-1 text-xs",
                story.status === "finished"  ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10" :
                story.status === "rewriting" ? "border-blue-500/40 text-blue-600 bg-blue-500/10" :
                "border-amber-500/40 text-amber-600 bg-amber-500/10"
              )}>
                {story.status === "finished" ? "Terminé" : story.status === "rewriting" ? "En réécriture" : "En cours"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl">{story.title}</h1>
            {story.author_name && (
              <div className="mt-2 flex items-center gap-3">
                <Link href={`/profil/${encodeURIComponent(story.author_username ?? story.author_name ?? "")}`} className="text-sm text-muted-foreground hover:text-[var(--accent)] transition-colors">
                  par {story.author_name}
                </Link>
                {authorId && <FollowButton targetUserId={authorId} targetUsername={story.author_name} compact />}
              </div>
            )}
            {story.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{story.description}</p>}

            {/* Stats */}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye size={14} />
                <span>{formatCount(story.views ?? 0)} vue{(story.views ?? 0) !== 1 ? "s" : ""}</span>
              </div>
              <button
                onClick={toggleLike}
                disabled={likeBusy}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                  liked
                    ? "border-rose-400/50 bg-rose-500/10 text-rose-500"
                    : "border-border text-muted-foreground hover:border-rose-400/40 hover:text-rose-500"
                )}
              >
                <Heart size={14} className={cn("transition-all", liked ? "fill-rose-500" : "")} />
                <span>{formatCount(story.likes_count ?? 0)}</span>
              </button>
              <span className="text-xs text-muted-foreground">
                {chapters.length === 1 ? "1 chapitre" : `${chapters.length} chapitres`}
              </span>
            </div>

            {/* ── Note / étoiles ──────────────────────────── */}
            <div className="mt-5 rounded-2xl border border-border bg-secondary/20 px-4 py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Interactive stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= (hoverRating || userRating);
                    return (
                      <button
                        key={star}
                        disabled={ratingBusy}
                        onClick={() => submitRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 disabled:cursor-wait"
                        aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={26}
                          className={cn(
                            "transition-colors",
                            filled
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent text-border hover:text-amber-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Score affiché */}
                <div className="flex items-baseline gap-1.5">
                  {(story.rating_count ?? 0) > 0 ? (
                    <>
                      <span className="font-serif text-2xl font-bold text-foreground">
                        {(story.rating_avg ?? 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">/ 5</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({story.rating_count} avis)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Pas encore noté</span>
                  )}
                </div>
              </div>

              {/* Feedback utilisateur */}
              {userRating > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Votre note : {userRating}/5
                  {userRating === 5 ? " ✨" : userRating >= 4 ? " 👏" : userRating >= 3 ? " 👍" : " 🤔"}
                </p>
              )}
            </div>

            {/* CTA */}
            {chapters.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/lire/${story.id}/${chapters[0].id}`}
                  className={cn(buttonVariants({ size: "lg" }), "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90")}
                >
                  <BookOpen size={16} />
                  {chapters.length === 1 ? "Lire le one-shot" : "Commencer la lecture"}
                </Link>
                <LibraryButton storyId={story.id} />
              </div>
            )}
          </div>
        </div>

        {/* ── Chapitres ───────────────────────────────────────────────── */}
        {chapters.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-serif text-2xl">
              {chapters.length === 1 ? "Chapitre" : "Chapitres"}
            </h2>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  href={`/lire/${story.id}/${chapter.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-all hover:border-[var(--accent)]/40 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Chapitre {index + 1}</p>
                    <p className="font-medium group-hover:text-[var(--accent)] transition-colors">{chapter.title}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground ml-4">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatCount(chapter.views_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {chapter.comment_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
