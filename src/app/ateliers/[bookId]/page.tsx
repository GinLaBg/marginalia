"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, BookOpenText, Check, Globe, Heading2, Italic, Pencil, Plus, Trash2, Underline, UserRoundPlus, Users, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedCover } from "@/components/da/generated-cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countChapterWords, type WorkshopBook, type WorkshopChapter, type WorkshopCharacter } from "@/lib/ateliers";
import {
  fetchStoryById, saveChapterContent, addChapter as dbAddChapter,
  deleteChapter as dbDeleteChapter, deleteStory as dbDeleteStory,
  addCharacter as dbAddCharacter, updateCharacter as dbUpdateCharacter,
  deleteCharacter as dbDeleteCharacter,
} from "@/lib/ateliers-supabase";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AtelierBookEditorPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const bookId = typeof params.bookId === "string" ? params.bookId : "";

  const [book, setBook] = useState<WorkshopBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [characterDraft, setCharacterDraft] = useState({ name: "", role: "", notes: "" });
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingCharacterDraft, setEditingCharacterDraft] = useState<WorkshopCharacter | null>(null);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookId) return;
    fetchStoryById(bookId).then((story) => {
      if (!story) { router.replace("/ateliers"); return; }
      setBook(story);
      setActiveChapterId(story.chapters[0]?.id ?? "");
      setLoading(false);
    });
  }, [bookId, router]);

  const activeChapter = useMemo(
    () => book?.chapters.find((c) => c.id === activeChapterId) ?? book?.chapters[0] ?? null,
    [activeChapterId, book]
  );

  // Sauvegarde automatique du contenu du chapitre (debounce 1s)
  function handleChapterContentChange(content: string) {
    if (!book || !activeChapterId) return;
    setBook((b) => b ? {
      ...b,
      chapters: b.chapters.map((c) => c.id === activeChapterId ? { ...c, content } : c),
    } : b);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveChapterContent(activeChapterId, content);
    }, 1000);
  }

  // Sync editor DOM when switching chapters
  useEffect(() => {
    if (editorRef.current && activeChapter) {
      const html = activeChapter.content ?? "";
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId]);

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    handleChapterContentChange(editorRef.current.innerHTML);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId]);

  function fmt(command: string, value?: string) {
    document.execCommand(command, false, value ?? "");
    editorRef.current?.focus();
  }

  async function handleAddChapter() {
    if (!book) return;
    const nextIndex = book.chapters.length + 1;
    const newChapter = await dbAddChapter(book.id, `Chapitre ${nextIndex}`, nextIndex);
    if (!newChapter) return;
    setBook((b) => b ? { ...b, chapters: [...b.chapters, newChapter] } : b);
    setActiveChapterId(newChapter.id);
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!book || book.chapters.length <= 1) return;
    await dbDeleteChapter(chapterId);
    const nextChapters = book.chapters.filter((c) => c.id !== chapterId);
    if (activeChapterId === chapterId) {
      const idx = book.chapters.findIndex((c) => c.id === chapterId);
      setActiveChapterId(nextChapters[Math.max(0, idx - 1)]?.id ?? "");
    }
    setBook((b) => b ? { ...b, chapters: nextChapters } : b);
  }

  async function handleDeleteStory() {
    await dbDeleteStory(bookId);
    router.replace("/ateliers");
  }

  async function togglePublishChapter(chapterId: string, currentlyPublished: boolean) {
    const supabase = createClient();
    setPublishing(true);

    await supabase.from("chapters").update({
      is_published: !currentlyPublished,
      published_at: !currentlyPublished ? new Date().toISOString() : null,
    }).eq("id", chapterId);

    // Recalculate published chapter count
    const { count } = await supabase
      .from("chapters")
      .select("id", { count: "exact", head: true })
      .eq("story_id", bookId)
      .eq("is_published", true);

    const publishedCount = count ?? 0;

    // If publishing any chapter → also publish the story; if unpublishing all → unpublish story
    if (!currentlyPublished) {
      await supabase.from("stories").update({
        is_published: true,
        published_at: new Date().toISOString(),
        chapter_count: publishedCount,
      }).eq("id", bookId);
    } else {
      await supabase.from("stories").update({
        is_published: publishedCount > 0,
        published_at: publishedCount > 0 ? undefined : null,
        chapter_count: publishedCount,
      }).eq("id", bookId);
    }

    const updated = await fetchStoryById(bookId);
    if (updated) setBook(updated);
    setPublishing(false);
  }

  async function handleAddCharacter() {
    if (!book || !characterDraft.name.trim()) return;
    const newChar = await dbAddCharacter(book.id, characterDraft);
    if (!newChar) return;
    setBook((b) => b ? { ...b, characters: [newChar, ...b.characters] } : b);
    setCharacterDraft({ name: "", role: "", notes: "" });
  }

  async function handleSaveEditCharacter() {
    if (!book || !editingCharacterDraft) return;
    await dbUpdateCharacter(editingCharacterDraft.id, editingCharacterDraft);
    setBook((b) => b ? {
      ...b,
      characters: b.characters.map((c) => c.id === editingCharacterDraft.id ? editingCharacterDraft : c),
    } : b);
    setEditingCharacterId(null);
    setEditingCharacterDraft(null);
  }

  async function handleDeleteCharacter(characterId: string) {
    if (!book) return;
    await dbDeleteCharacter(characterId);
    setBook((b) => b ? { ...b, characters: b.characters.filter((c) => c.id !== characterId) } : b);
    if (editingCharacterId === characterId) { setEditingCharacterId(null); setEditingCharacterDraft(null); }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Chargement...</p>
    </div>
  );

  if (!book || !activeChapter) return null;

  const totalWords = book.chapters.reduce((sum, c) => sum + countChapterWords(c.content), 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(191,145,93,0.18),_transparent_28%),linear-gradient(180deg,_rgba(250,246,238,0.95),_rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(191,145,93,0.1),_transparent_24%),linear-gradient(180deg,_rgba(10,10,12,1),_rgba(5,5,7,1))]">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-background/88 p-5 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.45)] backdrop-blur dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/ateliers" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
              <ArrowLeft size={14} />
              Retour
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <BookOpenText size={12} />
              Atelier d&apos;ecriture
            </div>
            {confirmDeleteStory ? (
              <div className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/5 px-3 py-1 text-xs text-red-500">
                <span>Supprimer definitivement ?</span>
                <button onClick={handleDeleteStory} className="font-semibold hover:underline">Oui</button>
                <span>·</span>
                <button onClick={() => setConfirmDeleteStory(false)} className="hover:underline">Non</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteStory(true)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-500"
              >
                <Trash2 size={12} />
                Supprimer l&apos;histoire
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Chapitres", value: book.chapters.length },
              { label: "Mots", value: totalWords },
              { label: "Personnages", value: book.characters.length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <p className="mt-1 font-serif text-2xl">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">

          {/* Zone d'écriture */}
          <main className="order-1 rounded-[2rem] border border-border bg-background/92 p-4 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.4)] dark:bg-[#101114] dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)] sm:p-5 xl:order-2">
            <div className="grid gap-4 border-b border-border pb-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Titre du livre</span>
                  <Input value={book.title} onChange={(e) => setBook((b) => b ? { ...b, title: e.target.value } : b)} className="h-11" />
                </label>
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverImage} alt={book.title} className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] w-full">
                      <GeneratedCover title={book.title} author={book.authorName || "Atelier"} size="md" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Titre du chapitre</span>
                  <Input
                    value={activeChapter.title}
                    onChange={(e) => setBook((b) => b ? {
                      ...b,
                      chapters: b.chapters.map((c) => c.id === activeChapterId ? { ...c, title: e.target.value } : c),
                    } : b)}
                    placeholder="Le nom de ce chapitre"
                    className="h-11"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Phrase d&apos;ambiance</span>
                  <Input value={book.synopsis || ""} onChange={(e) => setBook((b) => b ? { ...b, synopsis: e.target.value } : b)} placeholder="Le fil rouge de ton livre" className="h-11" />
                </label>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ecriture</p>
                  <h2 className="mt-1 font-serif text-2xl sm:text-3xl">Page du chapitre</h2>
                </div>
                <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  Sauvegarde automatique
                </span>
              </div>
              <div className="rounded-[2rem] border border-border bg-[#fffdf8] shadow-inner dark:bg-[#16181d] overflow-hidden">
                {/* Formatting toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-3 py-2">
                  {/* Text style */}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("bold"); }} title="Gras (Ctrl+B)" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Bold size={14} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("italic"); }} title="Italique (Ctrl+I)" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Italic size={14} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("underline"); }} title="Souligné (Ctrl+U)" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Underline size={14} /></button>
                  <div className="mx-1 h-4 w-px bg-border/60" />
                  {/* Alignment */}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("justifyLeft"); }} title="Aligner à gauche" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><AlignLeft size={14} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("justifyCenter"); }} title="Centrer" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><AlignCenter size={14} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("justifyRight"); }} title="Aligner à droite" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><AlignRight size={14} /></button>
                  <div className="mx-1 h-4 w-px bg-border/60" />
                  {/* Heading */}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("formatBlock", "h2"); }} title="Titre" className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Heading2 size={14} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("formatBlock", "p"); }} title="Paragraphe normal" className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">¶</button>
                  <div className="mx-1 h-4 w-px bg-border/60" />
                  {/* Remove formatting */}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); fmt("removeFormat"); }} title="Supprimer la mise en forme" className="rounded-lg px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Aa×</button>
                </div>
                {/* Editable area */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  data-placeholder="Ecris ici comme sur une page tres simple..."
                  className="min-h-[52vh] w-full bg-transparent px-5 py-4 font-serif text-[1rem] leading-7 text-foreground outline-none sm:min-h-[60vh] sm:text-[1.05rem] sm:leading-8 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </div>
          </main>

          {/* Sidebar chapitres */}
          <aside className="order-2 rounded-[2rem] border border-border bg-background/88 p-4 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)] xl:order-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Navigation</p>
                <h2 className="mt-1 font-serif text-2xl">Chapitres</h2>
              </div>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={handleAddChapter}>
                <Plus size={14} />
                Ajouter
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 xl:block xl:space-y-3 xl:overflow-visible xl:pb-0">
              {book.chapters.map((chapter, index) => {
                const isActive = chapter.id === activeChapterId;
                const canDelete = book.chapters.length > 1;
                return (
                  <div key={chapter.id} className="group relative min-w-[190px] xl:min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                        isActive ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-border bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <p className="pr-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Chapitre {index + 1}</p>
                      <p className="mt-1 font-medium text-foreground">{chapter.title || `Chapitre ${index + 1}`}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{countChapterWords(chapter.content)} mots</p>
                    </button>
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={(e) => { e.stopPropagation(); togglePublishChapter(chapter.id, !!chapter.is_published); }}
                      className={cn(
                        "mt-1.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                        chapter.is_published
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          : "bg-muted/60 text-muted-foreground hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                      )}
                    >
                      <Globe size={10} />
                      {chapter.is_published ? "Publié" : "Publier"}
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                        className="absolute right-2.5 top-2.5 rounded-lg p-1 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                        aria-label="Supprimer ce chapitre"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Sidebar personnages */}
          <aside className="order-3 space-y-6">
            <section className="rounded-[2rem] border border-border bg-background/88 p-5 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Users size={13} />
                Personnages
              </div>
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Nom</span>
                  <Input value={characterDraft.name} onChange={(e) => setCharacterDraft((c) => ({ ...c, name: e.target.value }))} placeholder="Nom du personnage" className="h-11" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Role</span>
                  <Input value={characterDraft.role} onChange={(e) => setCharacterDraft((c) => ({ ...c, role: e.target.value }))} placeholder="Hero, interest, rival, mentor..." className="h-11" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Notes</span>
                  <textarea
                    value={characterDraft.notes}
                    onChange={(e) => setCharacterDraft((c) => ({ ...c, notes: e.target.value }))}
                    placeholder="Traits, secrets, tension, lien avec l'histoire..."
                    className="min-h-28 rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </label>
                <Button type="button" className="gap-2 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90" onClick={handleAddCharacter}>
                  <UserRoundPlus size={15} />
                  Ajouter le personnage
                </Button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-background/88 p-5 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
              <p className="mb-4 font-serif text-2xl">Casting du livre</p>
              {book.characters.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-4 py-6 text-sm text-muted-foreground">
                  Ajoute tes personnages ici pour garder leurs roles et leurs details sous les yeux.
                </div>
              )}
              <div className="space-y-3">
                {book.characters.map((character) => {
                  const isEditing = editingCharacterId === character.id;
                  if (isEditing && editingCharacterDraft) {
                    return (
                      <article key={character.id} className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 px-4 py-4">
                        <div className="grid gap-2">
                          <Input value={editingCharacterDraft.name} onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, name: e.target.value } : d)} placeholder="Nom" className="h-9 text-sm" />
                          <Input value={editingCharacterDraft.role} onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, role: e.target.value } : d)} placeholder="Role" className="h-9 text-sm" />
                          <textarea
                            value={editingCharacterDraft.notes}
                            onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, notes: e.target.value } : d)}
                            placeholder="Notes"
                            className="min-h-20 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          />
                          <div className="flex gap-2">
                            <Button type="button" size="sm" className="flex-1 gap-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90" onClick={handleSaveEditCharacter}>
                              <Check size={13} /> Sauvegarder
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => { setEditingCharacterId(null); setEditingCharacterDraft(null); }}>
                              <X size={13} />
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                  return (
                    <article key={character.id} className="group relative rounded-2xl border border-border bg-muted/25 px-4 py-4">
                      <p className="font-medium text-foreground">{character.name}</p>
                      {character.role && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{character.role}</p>}
                      {character.notes && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{character.notes}</p>}
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => { setEditingCharacterId(character.id); setEditingCharacterDraft({ ...character }); }}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCharacter(character.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
