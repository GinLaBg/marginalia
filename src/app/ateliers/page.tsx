"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookCheck, BookCopy, BookOpenText, Globe, Pencil, PencilLine, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GeneratedCover } from "@/components/da/generated-cover";
import { cn } from "@/lib/utils";
import { formatWorkshopDate, type WorkshopBook, type WorkshopStatus } from "@/lib/ateliers";
import { fetchUserStories, updateStoryStatus } from "@/lib/ateliers-supabase";
import { createClient } from "@/lib/supabase";

const STATUS_META: Record<WorkshopStatus, {
  title: string; description: string; icon: typeof PencilLine;
  accentClass: string; panelClass: string; emptyTitle: string; emptyBody: string;
}> = {
  drafting: {
    title: "En cours d\u2019ecriture",
    description: "Tes projets vivants, en train de prendre forme.",
    icon: PencilLine, accentClass: "text-amber-600",
    panelClass: "border-amber-200/70 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20",
    emptyTitle: "Aucun livre en cours",
    emptyBody: "Commence un nouveau manuscrit pour le voir apparaitre ici.",
  },
  finished: {
    title: "Livres termines",
    description: "Les manuscrits finalises et prets a etre relus.",
    icon: BookCheck, accentClass: "text-emerald-600",
    panelClass: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20",
    emptyTitle: "Aucun livre termine",
    emptyBody: "Quand un projet sera boucle, il arrivera dans cette section.",
  },
  rewriting: {
    title: "En reecriture",
    description: "Les versions que tu retravailles chapitre par chapitre.",
    icon: BookCopy, accentClass: "text-blue-600",
    panelClass: "border-blue-200/70 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20",
    emptyTitle: "Aucune reecriture en cours",
    emptyBody: "Les projets en revision apparaitront ici.",
  },
};

const STATUS_LABELS: Record<WorkshopStatus, string> = {
  drafting: "En cours",
  finished: "Terminé",
  rewriting: "Réécriture",
};

const STATUS_PILL: Record<WorkshopStatus, string> = {
  drafting: "border-amber-400/60 bg-amber-500/10 text-amber-600",
  finished: "border-emerald-400/60 bg-emerald-500/10 text-emerald-600",
  rewriting: "border-blue-400/60 bg-blue-500/10 text-blue-600",
};

export default function AteliersPage() {
  const [books, setBooks] = useState<WorkshopBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setLoggedIn(true);
        const stories = await fetchUserStories();
        setBooks(stories);
      }
      setLoading(false);
    });
  }, []);

  async function changeStatus(bookId: string, newStatus: WorkshopStatus) {
    setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, status: newStatus } : b));
    await updateStoryStatus(bookId, newStatus);
  }

  const booksByStatus = useMemo(() => ({
    drafting: books.filter((b) => b.status === "drafting"),
    finished: books.filter((b) => b.status === "finished"),
    rewriting: books.filter((b) => b.status === "rewriting"),
  }), [books]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <BookOpenText size={13} />
            Atelier individuel
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl">Ton espace d&apos;ecriture</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ecris a ton rythme, organise tes manuscrits par etat d&apos;avancement et garde une vue claire sur ce que tu es en train de construire.
          </p>
        </div>
        {loggedIn ? (
          <Link href="/ateliers/nouveau" className={cn(buttonVariants({ size: "lg" }), "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90")}>
            <Plus />
            Ecrire un nouveau livre
          </Link>
        ) : (
          <Link href="/auth/login" className={cn(buttonVariants({ size: "lg" }), "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90")}>
            Se connecter pour ecrire
          </Link>
        )}
      </div>

      {!loggedIn && !loading && (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
          <p className="font-serif text-2xl">Connecte-toi pour acceder a tes ateliers</p>
          <p className="mt-3 text-sm text-muted-foreground">Tes histoires sont sauvegardees et accessibles depuis n&apos;importe quel appareil.</p>
          <Link href="/auth/login" className={cn(buttonVariants(), "mt-6 bg-[var(--accent)] text-white")}>Se connecter</Link>
        </div>
      )}

      {loggedIn && (
        <div className="grid gap-6 lg:grid-cols-3">
          {(["drafting", "finished", "rewriting"] as WorkshopStatus[]).map((status) => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            const sectionBooks = booksByStatus[status];
            return (
              <section key={status} className={`rounded-3xl border p-5 ${meta.panelClass}`}>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <div className={`mb-3 inline-flex rounded-xl bg-background/70 p-2 ${meta.accentClass}`}>
                      <Icon size={18} />
                    </div>
                    <h2 className="font-serif text-xl text-foreground">{meta.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
                  </div>
                  <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {loading ? "..." : sectionBooks.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {!loading && sectionBooks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-8 text-center">
                      <p className="font-serif text-lg text-foreground">{meta.emptyTitle}</p>
                      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{meta.emptyBody}</p>
                    </div>
                  )}
                  {sectionBooks.map((book) => (
                    <div key={book.id} className="rounded-2xl border border-border bg-background/85 shadow-sm transition-shadow hover:shadow-md">
                      {/* Clickable area → editor */}
                      <Link href={`/ateliers/${book.id}`} className="block p-4 hover:bg-secondary/20 rounded-t-2xl transition-colors">
                        <div className="flex gap-4">
                          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {book.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                            ) : (
                              <GeneratedCover title={book.title} author={book.authorName || "Atelier"} size="sm" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {book.isPublished && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
                                  <Globe size={9} /> Publié
                                </span>
                              )}
                            </div>
                            <p className="font-serif text-lg text-foreground">{book.title}</p>
                            <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">{book.genre}</p>
                            {book.authorName && <p className="mt-0.5 text-xs text-muted-foreground">par {book.authorName}</p>}
                            {book.synopsis && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{book.synopsis}</p>}
                          </div>
                        </div>
                      </Link>

                      {/* Actions bar */}
                      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
                        {/* Status pills */}
                        <div className="flex items-center gap-1">
                          {(["drafting", "finished", "rewriting"] as WorkshopStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => changeStatus(book.id, s)}
                              className={cn(
                                "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                                book.status === s
                                  ? STATUS_PILL[s]
                                  : "border-border text-muted-foreground hover:border-[var(--accent)]/40 hover:text-foreground"
                              )}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>

                        {/* Edit link */}
                        <Link
                          href={`/ateliers/${book.id}/modifier`}
                          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil size={12} />
                          Modifier
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
