"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  Check,
  Pencil,
  Plus,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedCover } from "@/components/da/generated-cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  countChapterWords,
  loadWorkshopBooks,
  saveWorkshopBooks,
  type WorkshopBook,
  type WorkshopChapter,
  type WorkshopCharacter,
} from "@/lib/ateliers";
import { cn } from "@/lib/utils";

function loadBookById(bookId: string): WorkshopBook | null {
  return loadWorkshopBooks().find((entry) => entry.id === bookId) ?? null;
}

function updateBookCollection(updatedBook: WorkshopBook) {
  const books = loadWorkshopBooks();
  const nextBooks = books.map((book) => (book.id === updatedBook.id ? updatedBook : book));
  saveWorkshopBooks(nextBooks);
}

export default function AtelierBookEditorPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const bookId = typeof params.bookId === "string" ? params.bookId : "";
  const [book, setBook] = useState<WorkshopBook | null>(() => loadBookById(bookId));
  const [activeChapterId, setActiveChapterId] = useState<string>(
    () => loadBookById(bookId)?.chapters[0]?.id ?? ""
  );
  const [characterDraft, setCharacterDraft] = useState({ name: "", role: "", notes: "" });
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingCharacterDraft, setEditingCharacterDraft] = useState<WorkshopCharacter | null>(null);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState(false);

  useEffect(() => {
    if (!bookId || !book) router.replace("/ateliers");
  }, [book, bookId, router]);

  const activeChapter = useMemo(
    () =>
      book?.chapters.find((chapter) => chapter.id === activeChapterId) ??
      book?.chapters[0] ??
      null,
    [activeChapterId, book]
  );

  function persistBook(nextBook: WorkshopBook) {
    const stamped = { ...nextBook, updatedAt: new Date().toISOString() };
    setBook(stamped);
    updateBookCollection(stamped);
  }

  function updateChapter(chapterId: string, updates: Partial<WorkshopChapter>) {
    if (!book) return;
    persistBook({
      ...book,
      chapters: book.chapters.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)),
    });
  }

  function addChapter() {
    if (!book) return;
    const nextIndex = book.chapters.length + 1;
    const newChapter: WorkshopChapter = {
      id: `${book.id}-chapter-${Date.now()}`,
      title: `Chapitre ${nextIndex}`,
      content: "",
    };
    persistBook({
      ...book,
      chapters: [...book.chapters, newChapter],
      chapterCount: Math.max(book.chapterCount, nextIndex),
    });
    setActiveChapterId(newChapter.id);
  }

  function deleteChapter(chapterId: string) {
    if (!book || book.chapters.length <= 1) return;
    const nextChapters = book.chapters.filter((c) => c.id !== chapterId);
    // Si on supprime le chapitre actif, on bascule sur le précédent ou le premier
    if (activeChapterId === chapterId) {
      const idx = book.chapters.findIndex((c) => c.id === chapterId);
      const next = nextChapters[Math.max(0, idx - 1)];
      setActiveChapterId(next?.id ?? "");
    }
    persistBook({ ...book, chapters: nextChapters, chapterCount: nextChapters.length });
  }

  function deleteStory() {
    const books = loadWorkshopBooks();
    saveWorkshopBooks(books.filter((b) => b.id !== bookId));
    router.replace("/ateliers");
  }

  function addCharacter() {
    if (!book || !characterDraft.name.trim()) return;
    const newChar: WorkshopCharacter = {
      id: `${book.id}-character-${Date.now()}`,
      name: characterDraft.name.trim(),
      role: characterDraft.role.trim(),
      notes: characterDraft.notes.trim(),
    };
    persistBook({ ...book, characters: [newChar, ...book.characters] });
    setCharacterDraft({ name: "", role: "", notes: "" });
  }

  function startEditCharacter(character: WorkshopCharacter) {
    setEditingCharacterId(character.id);
    setEditingCharacterDraft({ ...character });
  }

  function saveEditCharacter() {
    if (!book || !editingCharacterDraft) return;
    persistBook({
      ...book,
      characters: book.characters.map((c) =>
        c.id === editingCharacterDraft.id ? editingCharacterDraft : c
      ),
    });
    setEditingCharacterId(null);
    setEditingCharacterDraft(null);
  }

  function cancelEditCharacter() {
    setEditingCharacterId(null);
    setEditingCharacterDraft(null);
  }

  function deleteCharacter(characterId: string) {
    if (!book) return;
    persistBook({
      ...book,
      characters: book.characters.filter((c) => c.id !== characterId),
    });
    if (editingCharacterId === characterId) cancelEditCharacter();
  }

  function updateBookMeta(updates: Partial<WorkshopBook>) {
    if (!book) return;
    persistBook({ ...book, ...updates });
  }

  if (!book || !activeChapter) return null;

  const totalWords = book.chapters.reduce(
    (sum, c) => sum + countChapterWords(c.content),
    0
  );

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

            {/* Supprimer l'histoire */}
            {confirmDeleteStory ? (
              <div className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/5 px-3 py-1 text-xs text-red-500">
                <span>Supprimer definitivement ?</span>
                <button onClick={deleteStory} className="font-semibold hover:underline">
                  Oui
                </button>
                <span>·</span>
                <button onClick={() => setConfirmDeleteStory(false)} className="hover:underline">
                  Non
                </button>
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
              { label: "Mots",      value: totalWords },
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

          {/* ── Zone d'écriture ────────────────────────────────────────── */}
          <main className="order-1 rounded-[2rem] border border-border bg-background/92 p-4 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.4)] dark:bg-[#101114] dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)] sm:p-5 xl:order-2">
            <div className="grid gap-4 border-b border-border pb-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Titre du livre</span>
                  <Input
                    value={book.title}
                    onChange={(e) => updateBookMeta({ title: e.target.value })}
                    className="h-11"
                  />
                </label>
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
                  {book.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
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
                    onChange={(e) => updateChapter(activeChapter.id, { title: e.target.value })}
                    placeholder="Le nom de ce chapitre"
                    className="h-11"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Phrase d&apos;ambiance</span>
                  <Input
                    value={book.synopsis || ""}
                    onChange={(e) => updateBookMeta({ synopsis: e.target.value })}
                    placeholder="Le fil rouge de ton livre"
                    className="h-11"
                  />
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

              <div className="rounded-[2rem] border border-border bg-[#fffdf8] p-3 shadow-inner dark:bg-[#16181d] sm:p-4">
                <textarea
                  value={activeChapter.content}
                  onChange={(e) => updateChapter(activeChapter.id, { content: e.target.value })}
                  placeholder="Ecris ici comme sur une page tres simple..."
                  className="min-h-[52vh] w-full resize-none bg-transparent px-2 py-2 font-serif text-[1rem] leading-7 text-foreground outline-none placeholder:text-muted-foreground sm:min-h-[60vh] sm:text-[1.05rem] sm:leading-8"
                />
              </div>
            </div>
          </main>

          {/* ── Sidebar chapitres ──────────────────────────────────────── */}
          <aside className="order-2 rounded-[2rem] border border-border bg-background/88 p-4 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)] xl:order-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Navigation</p>
                <h2 className="mt-1 font-serif text-2xl">Chapitres</h2>
              </div>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addChapter}>
                <Plus size={14} />
                Ajouter
              </Button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 xl:block xl:space-y-3 xl:overflow-visible xl:pb-0">
              {book.chapters.map((chapter, index) => {
                const isActive = chapter.id === activeChapterId;
                const canDelete = book.chapters.length > 1;

                return (
                  <div key={chapter.id} className="relative min-w-[190px] xl:min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <p className="pr-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Chapitre {index + 1}
                      </p>
                      <p className="mt-1 font-medium text-foreground">{chapter.title || `Chapitre ${index + 1}`}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{countChapterWords(chapter.content)} mots</p>
                    </button>

                    {/* Bouton supprimer chapitre */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                        className="absolute right-2.5 top-2.5 rounded-lg p-1 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 [.min-w-\[190px\]:hover_&]:opacity-100 xl:[button:hover_~_&]:opacity-100"
                        style={{ opacity: undefined }}
                        aria-label="Supprimer ce chapitre"
                        title="Supprimer ce chapitre"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── Sidebar personnages ────────────────────────────────────── */}
          <aside className="order-3 space-y-6">

            {/* Formulaire ajout */}
            <section className="rounded-[2rem] border border-border bg-background/88 p-5 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Users size={13} />
                Personnages
              </div>
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Nom</span>
                  <Input
                    value={characterDraft.name}
                    onChange={(e) => setCharacterDraft((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Nom du personnage"
                    className="h-11"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Role</span>
                  <Input
                    value={characterDraft.role}
                    onChange={(e) => setCharacterDraft((c) => ({ ...c, role: e.target.value }))}
                    placeholder="Hero, interest, rival, mentor..."
                    className="h-11"
                  />
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
                <Button
                  type="button"
                  className="gap-2 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                  onClick={addCharacter}
                >
                  <UserRoundPlus size={15} />
                  Ajouter le personnage
                </Button>
              </div>
            </section>

            {/* Casting */}
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
                          <Input
                            value={editingCharacterDraft.name}
                            onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, name: e.target.value } : d)}
                            placeholder="Nom"
                            className="h-9 text-sm"
                          />
                          <Input
                            value={editingCharacterDraft.role}
                            onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, role: e.target.value } : d)}
                            placeholder="Role"
                            className="h-9 text-sm"
                          />
                          <textarea
                            value={editingCharacterDraft.notes}
                            onChange={(e) => setEditingCharacterDraft((d) => d ? { ...d, notes: e.target.value } : d)}
                            placeholder="Notes"
                            className="min-h-20 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="flex-1 gap-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                              onClick={saveEditCharacter}
                            >
                              <Check size={13} /> Sauvegarder
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEditCharacter}
                            >
                              <X size={13} />
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={character.id}
                      className="group relative rounded-2xl border border-border bg-muted/25 px-4 py-4"
                    >
                      <p className="font-medium text-foreground">{character.name}</p>
                      {character.role && (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {character.role}
                        </p>
                      )}
                      {character.notes && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {character.notes}
                        </p>
                      )}

                      {/* Actions modifier / supprimer */}
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => startEditCharacter(character)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                          aria-label="Modifier le personnage"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCharacter(character.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Supprimer le personnage"
                          title="Supprimer"
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
