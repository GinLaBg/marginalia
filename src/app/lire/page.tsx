"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { BookOpen, Eye, Filter, Heart, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GeneratedCover } from "@/components/da/generated-cover";
import { cn } from "@/lib/utils";

type PublishedStory = {
  id: string;
  title: string;
  genre: string;
  author_name: string | null;
  description: string | null;
  cover_url: string | null;
  status: string;
  published_at: string;
  chapter_count: number;
  user_id: string;
  views: number | null;
  likes_count: number | null;
  rating_avg: number | null;
  rating_count: number | null;
};

const GENRES = ["Tous", "Romance", "Dark romance", "Romantasy", "Fantasy", "Young adult", "New adult", "Thriller", "Mystere", "Science-fiction", "Classique"];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function LirePage() {
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("Tous");
  const [type, setType] = useState<"tous" | "one-shot" | "en-cours" | "termine">("tous");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("stories")
      .select("id, title, genre, author_name, description, cover_url, status, published_at, chapter_count, user_id, views, likes_count, rating_avg, rating_count")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[Lire] Supabase error:", error);
        console.log("[Lire] Stories fetched:", data?.length, data);
        setStories(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = stories.filter((s) => {
    if (genre !== "Tous" && s.genre !== genre) return false;
    if (type === "one-shot" && s.chapter_count !== 1) return false;
    if (type === "en-cours" && s.status !== "drafting") return false;
    if (type === "termine" && s.status !== "finished") return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <BookOpen size={13} />
          Fictions communautaires
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl">Lire</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Histoires publiees par la communaute Marginalia. Chapitres inedits, one-shots, sagas en cours.
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 space-y-4"
      >
        {/* Type */}
        <div className="flex flex-wrap gap-2">
          {(["tous", "one-shot", "en-cours", "termine"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                type === t
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-border text-muted-foreground hover:border-[var(--accent)]/50 hover:text-foreground"
              }`}
            >
              {t === "tous" ? "Tout" : t === "one-shot" ? "One-shot" : t === "en-cours" ? "En cours" : "Termine"}
            </button>
          ))}
        </div>

        {/* Genre */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={13} className="text-muted-foreground" />
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                genre === g
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-border text-muted-foreground hover:border-[var(--accent)]/40"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grille */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-muted/30 h-72" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-20 text-center"
        >
          <p className="font-serif text-2xl">Aucune histoire publiee</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Sois le premier a publier depuis tes{" "}
            <Link href="/ateliers" className="text-[var(--accent)] hover:underline">Ateliers</Link>.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={genre + type}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((story) => (
              <motion.div key={story.id} variants={cardVariants}>
                <Link href={`/lire/${story.id}`} className="group block rounded-2xl border border-border bg-card hover:border-[var(--accent)]/40 transition-all hover:-translate-y-1 overflow-hidden shadow-sm">
                  <div className="aspect-[2/3] w-full overflow-hidden">
                    {story.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.cover_url} alt={story.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <GeneratedCover title={story.title} author={story.author_name ?? "Auteur"} size="lg" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-lg leading-tight">{story.title}</p>
                    {story.author_name && (
                      <p className="mt-1 text-xs text-muted-foreground">par {story.author_name}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        {story.genre}
                      </span>
                      <span className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px]",
                        story.status === "finished"  ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-600" :
                        story.status === "rewriting" ? "border-blue-500/30 bg-blue-500/8 text-blue-600" :
                        "border-amber-500/30 bg-amber-500/8 text-amber-600"
                      )}>
                        {story.status === "finished" ? "Terminé" : story.status === "rewriting" ? "En réécriture" : "En cours"}
                      </span>
                      {story.chapter_count === 1 && (
                        <span className="text-[11px] text-muted-foreground">One-shot</span>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className={cn("flex items-center gap-1 text-[11px] font-medium", (story.rating_avg ?? 0) > 0 ? "text-amber-500" : "text-muted-foreground")}>
                        <Star size={11} className={cn((story.rating_avg ?? 0) > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                        {(story.rating_avg ?? 0) > 0 ? (story.rating_avg ?? 0).toFixed(1) : "—"}
                        {(story.rating_count ?? 0) > 0 && <span className="text-muted-foreground font-normal">({story.rating_count})</span>}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Eye size={11} />
                        {(story.views ?? 0) >= 1000 ? `${((story.views ?? 0) / 1000).toFixed(1)}k` : (story.views ?? 0)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Heart size={11} className={cn((story.likes_count ?? 0) > 0 ? "fill-rose-400 text-rose-400" : "")} />
                        {story.likes_count ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
