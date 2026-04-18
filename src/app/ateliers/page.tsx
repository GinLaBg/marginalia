"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookCheck, BookCopy, BookOpenText, PencilLine, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GeneratedCover } from "@/components/da/generated-cover";
import { cn } from "@/lib/utils";
import { formatWorkshopDate, loadWorkshopBooks, type WorkshopBook, type WorkshopStatus } from "@/lib/ateliers";

const STATUS_META: Record<
  WorkshopStatus,
  {
    title: string;
    description: string;
    icon: typeof PencilLine;
    accentClass: string;
    panelClass: string;
    emptyTitle: string;
    emptyBody: string;
  }
> = {
  drafting: {
    title: "Livres en cours d'ecriture",
    description: "Tes projets vivants, en train de prendre forme.",
    icon: PencilLine,
    accentClass: "text-amber-600",
    panelClass: "border-amber-200/70 bg-amber-50/60",
    emptyTitle: "Aucun livre en cours",
    emptyBody: "Commence un nouveau manuscrit pour le voir apparaitre ici.",
  },
  finished: {
    title: "Livres termines",
    description: "Les manuscrits finalises et prets a etre relus.",
    icon: BookCheck,
    accentClass: "text-emerald-600",
    panelClass: "border-emerald-200/70 bg-emerald-50/60",
    emptyTitle: "Aucun livre termine",
    emptyBody: "Quand un projet sera boucle, il arrivera dans cette section.",
  },
  rewriting: {
    title: "Livres en reecriture",
    description: "Les versions que tu retravailles chapitre par chapitre.",
    icon: BookCopy,
    accentClass: "text-blue-600",
    panelClass: "border-blue-200/70 bg-blue-50/60",
    emptyTitle: "Aucune reecriture en cours",
    emptyBody: "Les projets en revision apparaitront ici.",
  },
};

export default function AteliersPage() {
  const [books] = useState<WorkshopBook[]>(() => loadWorkshopBooks());

  const booksByStatus = useMemo(
    () => ({
      drafting: books.filter((book) => book.status === "drafting"),
      finished: books.filter((book) => book.status === "finished"),
      rewriting: books.filter((book) => book.status === "rewriting"),
    }),
    [books]
  );

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
            Ecris a ton rythme, organise tes manuscrits par etat d&apos;avancement et garde une vue claire sur ce que tu
            es en train de construire.
          </p>
        </div>
        <Link
          href="/ateliers/nouveau"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
          )}
        >
          <Plus />
          Ecrire un nouveau livre
        </Link>
      </div>

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
                  {sectionBooks.length}
                </span>
              </div>

              <div className="space-y-4">
                {sectionBooks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-8 text-center">
                    <p className="font-serif text-lg text-foreground">{meta.emptyTitle}</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{meta.emptyBody}</p>
                  </div>
                )}

                {sectionBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/ateliers/${book.id}`}
                    className="block rounded-2xl border border-border bg-background/85 p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-20">
                        {book.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <GeneratedCover
                            title={book.title}
                            author={book.authorName || "Atelier"}
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-serif text-lg text-foreground">{book.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{book.genre}</p>
                            {book.authorName && (
                              <p className="mt-1 text-xs text-muted-foreground">par {book.authorName}</p>
                            )}
                          </div>
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                            {book.chapterCount} chap.
                          </span>
                        </div>

                        {book.synopsis && (
                          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{book.synopsis}</p>
                        )}

                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Mis a jour le {formatWorkshopDate(book.updatedAt)}</span>
                          <span>
                            {status === "drafting" && "Brouillon actif"}
                            {status === "finished" && "Version finalisee"}
                            {status === "rewriting" && "Revision en cours"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
