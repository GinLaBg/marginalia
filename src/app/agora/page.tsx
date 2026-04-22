"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { MessageSquare, Search, Plus, Eye, ArrowRight, TrendingUp, Clock, Flame, Bell, BellOff, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchTopics, type AgoraTopic, type AgoraCategorie } from "@/lib/agora-supabase";
import { createClient as supabaseClient } from "@/lib/supabase";
import { fetchAgoraSubscriptions, toggleAgoraSubscription } from "@/lib/library-supabase";
import { createClient } from "@/lib/supabase";

/* ─── Variants ───────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

/* ─── Config ─────────────────────────────────────────────────────────────── */

type Filtre = "Tous" | AgoraCategorie;

const categories: Filtre[] = [
  "Tous", "Général", "Théories & Analyses", "Recommandations", "Écriture", "Débats", "Communauté",
];

const categorieColors: Record<AgoraCategorie, string> = {
  "Général":             "text-muted-foreground border-border",
  "Théories & Analyses": "text-violet-400 border-violet-400/40",
  "Recommandations":     "text-emerald-400 border-emerald-400/40",
  "Écriture":            "text-sky-400 border-sky-400/40",
  "Débats":              "text-rose-400 border-rose-400/40",
  "Communauté":          "text-amber-400 border-amber-400/40",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

/* ─── Row ────────────────────────────────────────────────────────────────── */

function SujetRow({ sujet, onLike }: { sujet: AgoraTopic; onLike: (id: string, delta: number) => void }) {
  const colors = categorieColors[sujet.categorie];
  const score  = (sujet.likes_count ?? 0) * 3 + sujet.nb_reponses * 2 + sujet.vues * 0.1;
  const chaud  = score > 60 || sujet.nb_reponses > 20 || sujet.vues > 500;

  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored: string[] = JSON.parse(localStorage.getItem("marginalia-topic-liked") ?? "[]");
    return stored.includes(sujet.id);
  });

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const delta = liked ? -1 : 1;
    setLiked(!liked);
    // Persist
    const stored: string[] = JSON.parse(localStorage.getItem("marginalia-topic-liked") ?? "[]");
    const updated = liked ? stored.filter((x) => x !== sujet.id) : [...stored, sujet.id];
    localStorage.setItem("marginalia-topic-liked", JSON.stringify(updated));
    onLike(sujet.id, delta);
  }

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/agora/${sujet.id}`}
        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-xl border border-border/50 px-5 py-4 hover:border-[var(--accent)]/30 hover:bg-card/40 transition-all duration-200"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {sujet.epingle && (
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-medium">Épinglé</span>
            )}
            {chaud && (
              <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-widest text-rose-400 font-medium">
                <Flame size={10} /> Populaire
              </span>
            )}
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border font-normal", colors)}>
              {sujet.categorie}
            </Badge>
          </div>
          <p className="font-medium text-sm leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {sujet.titre}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            par {sujet.auteur_username} · {timeAgo(sujet.updated_at ?? sujet.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 transition-all",
              liked
                ? "border-rose-400/50 bg-rose-500/10 text-rose-500"
                : "border-border/50 hover:border-rose-400/40 hover:text-rose-500"
            )}
          >
            <Heart size={12} className={cn("transition-all", liked ? "fill-rose-500" : "")} />
            {sujet.likes_count ?? 0}
          </button>
          <span className="flex items-center gap-1.5"><MessageSquare size={13} />{sujet.nb_reponses}</span>
          <span className="flex items-center gap-1.5"><Eye size={13} />{sujet.vues}</span>
          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 px-5 py-4 animate-pulse">
      <div className="h-3 w-24 bg-muted rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted rounded mb-2" />
      <div className="h-3 w-40 bg-muted rounded" />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AgoraPage() {
  const router = useRouter();
  const [topics,    setTopics]    = useState<AgoraTopic[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [categorie, setCategorie] = useState<Filtre>("Tous");
  const [recherche, setRecherche] = useState("");
  const [tri,       setTri]       = useState<"recent" | "populaire" | "actif">("recent");
  const [subs,      setSubs]      = useState<string[]>([]);
  const [loggedIn,  setLoggedIn]  = useState(false);
  const likeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchTopics();
    setTopics(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setLoggedIn(true);
      const s = await fetchAgoraSubscriptions();
      setSubs(s);
    });
  }, []);

  function handleTopicLike(id: string, delta: number) {
    // Optimistic UI
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, likes_count: Math.max(0, (t.likes_count ?? 0) + delta) } : t));
    // Debounce DB call (prevent double-click spam)
    clearTimeout(likeTimers.current[id]);
    likeTimers.current[id] = setTimeout(() => {
      supabaseClient().rpc("toggle_topic_like", { tid: id, delta });
    }, 300);
  }

  async function handleToggleSub(cat: string) {
    const now = await toggleAgoraSubscription(cat);
    setSubs((prev) => now ? [...prev, cat] : prev.filter((c) => c !== cat));
  }

  const sujetsFiltres = topics
    .filter((s) => categorie === "Tous" || s.categorie === categorie)
    .filter((s) => s.titre.toLowerCase().includes(recherche.toLowerCase()))
    .sort((a, b) => {
      if (a.epingle !== b.epingle) return a.epingle ? -1 : 1;
      if (tri === "populaire") {
        const scoreA = (a.likes_count ?? 0) * 3 + a.nb_reponses * 2 + a.vues * 0.1;
        const scoreB = (b.likes_count ?? 0) * 3 + b.nb_reponses * 2 + b.vues * 0.1;
        return scoreB - scoreA;
      }
      if (tri === "actif") return b.nb_reponses - a.nb_reponses;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 60% 40% at 20% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent)" }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Communauté</p>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-serif text-3xl sm:text-4xl">Agora</h1>
              <Button
                size="sm"
                className="shrink-0 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent gap-1.5 mt-1"
                onClick={() => router.push("/agora/nouveau")}
              >
                <Plus size={14} /> Créer un sujet
              </Button>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Parlez de livres, débattez, échangez des recommandations et discutez écriture — sans prise de tête.
            </p>
          </motion.div>

          {/* ── Recherche ───────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mt-6 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Rechercher un sujet…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card/30 pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
            />
          </motion.div>

          {/* ── Filtres catégories ───────────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = categorie === cat;
              const isSubscribed = cat !== "Tous" && subs.includes(cat);
              return (
                <div key={cat} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setCategorie(cat)}
                    className={cn(
                      "rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-150 border",
                      isActive
                        ? "bg-[var(--accent)] text-white border-transparent"
                        : "border-border/60 text-muted-foreground hover:border-[var(--accent)]/40 hover:text-foreground"
                    )}
                  >
                    {cat}
                    {isSubscribed && <span className="ml-1 text-[9px]">🔔</span>}
                  </button>
                  {/* Bell subscribe button for non-"Tous" categories */}
                  {cat !== "Tous" && loggedIn && (
                    <button
                      onClick={() => handleToggleSub(cat)}
                      title={isSubscribed ? "Se désabonner" : "Suivre ce canal"}
                      className={cn(
                        "rounded-full p-1 transition-colors",
                        isSubscribed ? "text-[var(--accent)]" : "text-muted-foreground hover:text-[var(--accent)]"
                      )}
                    >
                      {isSubscribed ? <BellOff size={11} /> : <Bell size={11} />}
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* ── Tri ─────────────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="mr-1">Trier :</span>
            {([
              { key: "recent",    label: "Récent",    icon: Clock },
              { key: "populaire", label: "Populaire", icon: TrendingUp },
              { key: "actif",     label: "Actif",     icon: MessageSquare },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTri(key)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                  tri === key ? "text-[var(--accent)] bg-[var(--accent)]/10" : "hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon size={11} /> {label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Liste ───────────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
          ) : sujetsFiltres.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-muted-foreground text-sm"
            >
              {topics.length === 0
                ? "Aucun sujet pour l'instant. Soyez le premier à lancer une discussion !"
                : "Aucun sujet ne correspond à cette recherche."}
            </motion.div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2">
              {sujetsFiltres.map((sujet) => (
                <SujetRow key={sujet.id} sujet={sujet} onLike={handleTopicLike} />
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
