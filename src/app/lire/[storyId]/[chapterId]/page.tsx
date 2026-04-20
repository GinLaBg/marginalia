"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, List, Settings, X,
  Maximize2, Minimize2, Play, Pause, ChevronLeft, ChevronRight,
  MessageSquare, Send, Trash2, User,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
type Chapter   = { id: string; title: string; content: string; order: number; story_id: string };
type Story     = { id: string; title: string; author_name: string | null };
type Comment   = { id: string; user_id: string; username: string; content: string; created_at: string };
type NavChapter = { id: string; title: string; order: number };

// ─── Reader constants ─────────────────────────────────────────────────────────
const FONTS = [
  { label: "Lora",     value: "lora",     family: "'Lora', Georgia, serif" },
  { label: "Merriweather", value: "merri", family: "'Merriweather', Georgia, serif" },
  { label: "Playfair", value: "playfair", family: "'Playfair Display', Georgia, serif" },
  { label: "Georgia",  value: "georgia",  family: "Georgia, 'Times New Roman', serif" },
  { label: "Inter",    value: "inter",    family: "'Inter', system-ui, sans-serif" },
];

const BG_PRESETS = [
  { label: "Blanc",    bg: "#ffffff", text: "#1a1a1a" },
  { label: "Crème",    bg: "#faf6f0", text: "#2d2410" },
  { label: "Sépia",    bg: "#f4e8d0", text: "#3d2b1a" },
  { label: "Gris",     bg: "#e8e4e0", text: "#222222" },
  { label: "Ardoise",  bg: "#2a2e35", text: "#d8d4cc" },
  { label: "Nuit",     bg: "#0e0e11", text: "#c5c1b9" },
];

const TEXT_COLORS = [
  "#1a1a1a", "#3d2b1a", "#3a3a3a", "#888880", "#c8c4bc", "#f0ede8", "#ffffff",
];

type ReaderSettings = {
  fontValue: string;
  fontSize: number;
  bg: string;
  textColor: string;
  mode: "scroll" | "pages";
  autoScroll: boolean;
  scrollSpeed: number;
};

const DEFAULT_SETTINGS: ReaderSettings = {
  fontValue: "lora",
  fontSize: 18,
  bg: "#faf6f0",
  textColor: "#2d2410",
  mode: "scroll",
  autoScroll: false,
  scrollSpeed: 3,
};

function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("marginalia-reader-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function paginate(content: string, wordsPerPage = 350): string[][] {
  const paras = content.split("\n").filter((p) => p.trim());
  const pages: string[][] = [];
  let cur: string[] = [];
  let wc = 0;
  for (const p of paras) {
    const w = p.trim().split(/\s+/).length;
    if (wc + w > wordsPerPage && cur.length > 0) {
      pages.push(cur); cur = [p]; wc = w;
    } else { cur.push(p); wc += w; }
  }
  if (cur.length) pages.push(cur);
  return pages.length ? pages : [paras];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChapterReadPage() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const router = useRouter();

  const [chapter,     setChapter]     = useState<Chapter | null>(null);
  const [story,       setStory]       = useState<Story | null>(null);
  const [allChapters, setAllChapters] = useState<NavChapter[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [settings,      setSettings_]    = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [settingsOpen,  setSettingsOpen] = useState(false);
  const [isFullscreen,  setIsFullscreen] = useState(false);
  const [barVisible,    setBarVisible]   = useState(true);
  const [currentPage,   setCurrentPage]  = useState(0);

  // Comments
  const [comments,     setComments]     = useState<Comment[]>([]);
  const [commentText,  setCommentText]  = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [authUser,     setAuthUser]     = useState<{ id: string; username: string } | null>(null);

  const barTimeout     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const wrapperRef     = useRef<HTMLDivElement>(null);

  // ── Load persisted settings ──────────────────────────────────────────────────
  useEffect(() => { setSettings_(loadSettings()); }, []);

  function setSettings(fn: (prev: ReaderSettings) => ReaderSettings) {
    setSettings_((prev) => {
      const next = fn(prev);
      localStorage.setItem("marginalia-reader-settings", JSON.stringify(next));
      return next;
    });
  }

  // ── Load Google Fonts ────────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:wght@300;400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // ── Fetch chapter data ───────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("chapters").select("*").eq("id", chapterId).eq("is_published", true).single(),
      supabase.from("stories").select("id, title, author_name").eq("id", storyId).single(),
      supabase.from("chapters").select("id, title, order").eq("story_id", storyId).eq("is_published", true).order("order", { ascending: true }),
    ]).then(([{ data: ch }, { data: s }, { data: all }]) => {
      if (!ch || !s) { router.replace(`/lire/${storyId}`); return; }
      setChapter(ch);
      setStory(s);
      setAllChapters(all ?? []);
      setLoading(false);
    });
  }, [chapterId, storyId, router]);

  // ── Auth user ────────────────────────────────────────────────────────────────
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser({
          id: data.user.id,
          username: data.user.user_metadata?.username ?? data.user.email?.split("@")[0] ?? "Lecteur",
        });
      }
    });
  }, []);

  // ── Load comments ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chapterId) return;
    createClient()
      .from("chapter_comments")
      .select("id, user_id, username, content, created_at")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data ?? []));
  }, [chapterId]);

  // ── Increment views (once per story per session) ─────────────────────────────
  useEffect(() => {
    if (!storyId) return;
    const key = `viewed-${storyId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      createClient().rpc("increment_story_views", { sid: storyId });
    }
  }, [storyId]);

  // ── Auto-hide top bar ────────────────────────────────────────────────────────
  const showBar = useCallback(() => {
    setBarVisible(true);
    if (barTimeout.current) clearTimeout(barTimeout.current);
    if (!settingsOpen) {
      barTimeout.current = setTimeout(() => setBarVisible(false), 3500);
    }
  }, [settingsOpen]);

  useEffect(() => { showBar(); return () => { if (barTimeout.current) clearTimeout(barTimeout.current); }; }, [showBar]);
  useEffect(() => { if (settingsOpen) { setBarVisible(true); if (barTimeout.current) clearTimeout(barTimeout.current); } }, [settingsOpen]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    if (settings.autoScroll && settings.mode === "scroll") {
      scrollInterval.current = setInterval(() => window.scrollBy(0, 1), Math.round(60 / settings.scrollSpeed));
    }
    return () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  }, [settings.autoScroll, settings.scrollSpeed, settings.mode]);

  // ── Fullscreen API ───────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      setSettingsOpen(false);
      if (settings.mode === "pages") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown")  setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
        if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    setCurrentPage((p) => Math.max(0, p - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode]);

  // ── Reset page on chapter change ─────────────────────────────────────────────
  useEffect(() => setCurrentPage(0), [chapterId]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!authUser || !commentText.trim() || submitting) return;
    setSubmitting(true);

    const newComment = {
      chapter_id: chapterId,
      story_id:   storyId,
      user_id:    authUser.id,
      username:   authUser.username,
      content:    commentText.trim(),
    };

    const { data } = await createClient()
      .from("chapter_comments")
      .insert(newComment)
      .select("id, user_id, username, content, created_at")
      .single();

    if (data) setComments((prev) => [...prev, data]);
    setCommentText("");
    setSubmitting(false);
  }

  async function deleteComment(commentId: string) {
    await createClient().from("chapter_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000)    return "À l'instant";
    if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
    if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Chargement...</p></div>;
  if (!chapter || !story) return null;

  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter  = currentIndex > 0                        ? allChapters[currentIndex - 1] : null;
  const nextChapter  = currentIndex < allChapters.length - 1  ? allChapters[currentIndex + 1] : null;
  const fontFamily   = FONTS.find((f) => f.value === settings.fontValue)?.family ?? FONTS[0].family;
  const pages        = paginate(chapter.content);
  const totalPages   = pages.length;

  const textStyle = {
    fontFamily,
    fontSize: `${settings.fontSize}px`,
    lineHeight: "1.9",
    color: settings.textColor,
  };

  return (
    <>
    <div
      ref={wrapperRef}
      style={{ backgroundColor: settings.bg, minHeight: "100vh" }}
      onMouseMove={showBar}
      onTouchStart={showBar}
      onClick={() => { if (!settingsOpen) showBar(); }}
    >
      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 transition-opacity duration-500 sm:px-6",
          barVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ backgroundColor: settings.bg + "ee", backdropFilter: "blur(10px)" }}
      >
        {/* Left */}
        <Link
          href={`/lire/${storyId}`}
          style={{ color: settings.textColor }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          <List size={15} />
          <span className="hidden sm:inline">Sommaire</span>
        </Link>

        {/* Center */}
        <div className="text-center min-w-0">
          <p className="truncate text-sm font-medium max-w-[160px] sm:max-w-xs" style={{ color: settings.textColor, opacity: 0.9 }}>
            {story.title}
          </p>
          <p className="text-[11px] opacity-40" style={{ color: settings.textColor }}>
            Chapitre {currentIndex + 1}
            {settings.mode === "pages" && ` · Page ${currentPage + 1}/${totalPages}`}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5">
          {settings.mode === "scroll" && (
            <button
              onClick={() => setSettings((s) => ({ ...s, autoScroll: !s.autoScroll }))}
              style={{ color: settings.textColor }}
              className="rounded-xl p-2 opacity-60 hover:opacity-100 transition-opacity"
              title={settings.autoScroll ? "Arrêter" : "Défilement auto"}
            >
              {settings.autoScroll ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            style={{ color: settings.textColor, backgroundColor: settingsOpen ? settings.textColor + "15" : "transparent" }}
            className="rounded-xl p-2 opacity-60 hover:opacity-100 transition-all"
          >
            {settingsOpen ? <X size={16} /> : <Settings size={16} />}
          </button>
          <button
            onClick={toggleFullscreen}
            style={{ color: settings.textColor }}
            className="rounded-xl p-2 opacity-60 hover:opacity-100 transition-opacity"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div
        className={cn("transition-[padding] duration-300", settingsOpen ? "pr-[288px]" : "")}
      >
        <div className="mx-auto max-w-2xl px-5 pb-24 pt-6 sm:px-8">

          {/* Chapter header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: settings.textColor, opacity: 0.4 }}>
              Chapitre {currentIndex + 1}
            </p>
            <h1
              style={{ color: settings.textColor, fontFamily, fontSize: `${Math.round(settings.fontSize * 1.85)}px`, lineHeight: 1.2 }}
              className="font-bold"
            >
              {chapter.title}
            </h1>
            {story.author_name && (
              <p className="mt-3 text-sm" style={{ color: settings.textColor, opacity: 0.45, fontFamily }}>
                par {story.author_name}
              </p>
            )}
          </div>

          {/* Text */}
          <div style={textStyle}>
            {settings.mode === "scroll" ? (
              chapter.content.split("\n").map((para, i) =>
                para.trim()
                  ? <p key={i} className="mb-6">{para}</p>
                  : <br key={i} />
              )
            ) : (
              <>
                {pages[currentPage]?.map((para, i) => (
                  <p key={i} className="mb-6">{para}</p>
                ))}

                {/* Page navigation */}
                <div className="mt-14 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    style={{ color: settings.textColor, opacity: currentPage === 0 ? 0.25 : 0.65 }}
                    className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Précédente</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: Math.min(totalPages, 9) }).map((_, i) => {
                      const idx = totalPages <= 9 ? i : Math.round((i / 8) * (totalPages - 1));
                      const isActive = currentPage === idx || (totalPages > 9 && Math.abs(currentPage - idx) <= Math.floor(totalPages / 18));
                      return (
                        <span
                          key={i}
                          onClick={() => setCurrentPage(idx)}
                          role="button"
                          style={{ backgroundColor: isActive ? settings.textColor : settings.textColor + "35", width: isActive ? 18 : 6, height: 6, borderRadius: 9999, transition: "all 0.2s", display: "inline-block", cursor: "pointer" }}
                        />
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    style={{ color: settings.textColor, opacity: currentPage === totalPages - 1 ? 0.25 : 0.65 }}
                    className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Suivante</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Chapter nav — always in scroll mode, or on last page in pages mode */}
          {(settings.mode === "scroll" || currentPage === totalPages - 1) && (
            <div
              className="mt-16 flex items-center justify-between gap-4 border-t pt-10"
              style={{ borderColor: settings.textColor + "18" }}
            >
              {prevChapter ? (
                <Link
                  href={`/lire/${storyId}/${prevChapter.id}`}
                  style={{ color: settings.textColor, borderColor: settings.textColor + "28" }}
                  className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Chapitre précédent</span>
                </Link>
              ) : <div />}
              <Link
                href={`/lire/${storyId}`}
                className="text-xs opacity-35 hover:opacity-70 transition-opacity"
                style={{ color: settings.textColor }}
              >
                Sommaire
              </Link>
              {nextChapter ? (
                <Link
                  href={`/lire/${storyId}/${nextChapter.id}`}
                  style={{ color: settings.textColor, borderColor: settings.textColor + "28" }}
                  className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span className="hidden sm:inline">Chapitre suivant</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <div
                  className="rounded-2xl border border-dashed px-4 py-2.5 text-xs opacity-30"
                  style={{ color: settings.textColor, borderColor: settings.textColor + "30" }}
                >
                  Fin
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Settings panel (fixed right) ─────────────────────────────────────── */}
      <div
        className={cn(
          "fixed top-14 bottom-0 right-0 z-40 w-72 overflow-y-auto border-l p-6 transition-transform duration-300",
          settingsOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          backgroundColor: settings.bg + "f8",
          backdropFilter: "blur(16px)",
          borderColor: settings.textColor + "18",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: settings.textColor, opacity: 0.5 }}>
            Personnalisation
          </p>
          <button onClick={() => setSettingsOpen(false)} style={{ color: settings.textColor }} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-7">

          {/* Police */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: settings.textColor, opacity: 0.45 }}>Police</p>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSettings((s) => ({ ...s, fontValue: f.value }))}
                  style={{
                    fontFamily: f.family,
                    color: settings.textColor,
                    backgroundColor: settings.fontValue === f.value ? settings.textColor + "15" : "transparent",
                    borderColor: settings.fontValue === f.value ? settings.textColor + "55" : settings.textColor + "22",
                  }}
                  className="rounded-lg border px-2.5 py-1 text-xs transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Taille */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: settings.textColor, opacity: 0.45 }}>
              Taille — {settings.fontSize}px
            </p>
            <input
              type="range" min={13} max={26} value={settings.fontSize}
              onChange={(e) => setSettings((s) => ({ ...s, fontSize: +e.target.value }))}
              className="w-full"
              style={{ accentColor: settings.textColor }}
            />
            <div className="mt-1.5 flex justify-between" style={{ color: settings.textColor, opacity: 0.3, fontFamily }}>
              <span style={{ fontSize: 12 }}>A</span>
              <span style={{ fontSize: 18 }}>A</span>
            </div>
          </div>

          {/* Fond */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: settings.textColor, opacity: 0.45 }}>Fond</p>
            <div className="flex flex-wrap gap-2.5">
              {BG_PRESETS.map((b) => (
                <button
                  key={b.bg}
                  title={b.label}
                  onClick={() => setSettings((s) => ({ ...s, bg: b.bg, textColor: b.text }))}
                  className="h-9 w-9 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: b.bg,
                    boxShadow: settings.bg === b.bg
                      ? `0 0 0 2px ${settings.textColor}50, 0 0 0 4px ${b.bg}`
                      : "inset 0 0 0 1px rgba(128,128,128,0.25)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Couleur du texte */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: settings.textColor, opacity: 0.45 }}>Couleur du texte</p>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSettings((s) => ({ ...s, textColor: c }))}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: settings.textColor === c
                      ? `0 0 0 2px ${settings.bg}, 0 0 0 4px ${c}`
                      : "inset 0 0 0 1px rgba(128,128,128,0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mode de lecture */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: settings.textColor, opacity: 0.45 }}>Mode de lecture</p>
            <div className="grid grid-cols-2 gap-2">
              {(["scroll", "pages"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSettings((s) => ({ ...s, mode: m, autoScroll: m === "pages" ? false : s.autoScroll }))}
                  style={{
                    color: settings.textColor,
                    backgroundColor: settings.mode === m ? settings.textColor + "15" : "transparent",
                    borderColor: settings.mode === m ? settings.textColor + "50" : settings.textColor + "22",
                  }}
                  className="rounded-xl border py-2 text-xs transition-colors"
                >
                  {m === "scroll" ? "Défilement" : "Pages"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] opacity-30" style={{ color: settings.textColor }}>
              {settings.mode === "pages" ? "← → pour naviguer" : "Lis à ton rythme"}
            </p>
          </div>

          {/* Défilement auto (scroll only) */}
          {settings.mode === "scroll" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: settings.textColor, opacity: 0.45 }}>
                  Défilement auto
                </p>
                <button
                  onClick={() => setSettings((s) => ({ ...s, autoScroll: !s.autoScroll }))}
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{ backgroundColor: settings.autoScroll ? "#22c55e" : settings.textColor + "25" }}
                >
                  <span
                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: settings.autoScroll ? "translateX(16px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
              {settings.autoScroll && (
                <div>
                  <p className="text-[10px] mb-2 opacity-35" style={{ color: settings.textColor }}>
                    Vitesse — {settings.scrollSpeed}
                  </p>
                  <input
                    type="range" min={1} max={10} value={settings.scrollSpeed}
                    onChange={(e) => setSettings((s) => ({ ...s, scrollSpeed: +e.target.value }))}
                    className="w-full"
                    style={{ accentColor: settings.textColor }}
                  />
                  <div className="mt-1 flex justify-between text-[10px] opacity-25" style={{ color: settings.textColor }}>
                    <span>Lent</span><span>Rapide</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Comments section ─────────────────────────────────────────────────── */}
    <div className="border-t border-border bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-center gap-2">
          <MessageSquare size={18} className="text-muted-foreground" />
          <h2 className="font-serif text-2xl">Commentaires</h2>
          {comments.length > 0 && (
            <span className="ml-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {comments.length}
            </span>
          )}
        </div>

        {/* Form */}
        {authUser ? (
          <form onSubmit={submitComment} className="mb-10">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xs font-semibold text-[var(--accent)]">
                {authUser.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Partagez votre ressenti sur ce chapitre…"
                  rows={3}
                  maxLength={2000}
                  className="w-full resize-none rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--accent)]/50 focus:bg-background"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{commentText.length}/2000</span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim() || submitting}
                    className="gap-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                  >
                    <Send size={13} />
                    Publier
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-10 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-8 text-center">
            <User size={20} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <Link href="/auth/login" className="font-medium text-[var(--accent)] hover:underline">
                Connecte-toi
              </Link>{" "}
              pour laisser un commentaire
            </p>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/10 py-14 text-center">
            <MessageSquare size={24} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Pas encore de commentaires.</p>
            <p className="text-xs text-muted-foreground opacity-60">Sois le premier à réagir !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-border/80"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-semibold text-[var(--accent)]">
                  {comment.username[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    {authUser?.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-all hover:text-red-500"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
