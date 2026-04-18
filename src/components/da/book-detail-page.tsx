"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Award, BookMarked, BookOpen, Building2, Calendar, FileText, KeyRound, MessageSquare, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookDetailCover } from "@/components/da/book-detail-cover";
import { getPreferredCoverUrl } from "@/lib/da-covers";
import { findBookById, loadCommunityBooks, removeCommunityBook, saveCommunityBooks, type DABook } from "@/lib/da-books";
import { disableOwnerMode, enableOwnerMode, isOwnerModeEnabled } from "@/lib/da-owner";
import { cn } from "@/lib/utils";

const MOCK_REVIEWS = [
  { user: "Léa M.", rating: 5, date: "mars 2024", text: "Un chef-d'oeuvre absolu. Impossible de lacher les pages. La construction narrative est d'une intelligence rare." },
  { user: "Thomas R.", rating: 4, date: "fevr. 2024", text: "Tres bon livre, meme si la fin m'a laisse sur ma faim. L'ecriture est superbe et les personnages attachants." },
  { user: "Camille D.", rating: 5, date: "janv. 2024", text: "Lu en deux jours. La tension monte crescendo et le style de l'auteur est vraiment unique. A conseiller sans hesitation." },
  { user: "Hugo B.", rating: 3, date: "dec. 2023", text: "Bien ecrit mais parfois trop long. Certains passages auraient pu etre raccourcis sans perdre l'essentiel." },
];

const MOCK_DEBATES = [
  { question: "La fin justifie-t-elle les moyens pour les personnages principaux ?", votes: 142 },
  { question: "Ce livre aurait-il du recevoir un prix litteraire ?", votes: 98 },
  { question: "L'auteur romantise-t-il trop la noirceur de son sujet ?", votes: 77 },
];

interface BookDetailPageProps {
  bookId: string;
}

export function BookDetailPage({ bookId }: BookDetailPageProps) {
  const router = useRouter();
  const [isOwnerMode, setOwnerMode] = useState(() => isOwnerModeEnabled());
  const book: DABook | null = useMemo(() => findBookById(bookId) ?? null, [bookId]);

  const handleOwnerModeToggle = () => {
    if (isOwnerMode) {
      disableOwnerMode();
      setOwnerMode(false);
      return;
    }

    const pin = window.prompt("Entrez le code proprietaire pour activer la suppression");
    if (!pin) return;

    const unlocked = enableOwnerMode(pin);
    if (unlocked) {
      setOwnerMode(true);
    }
  };

  if (!book) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Link href="/da" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-1 text-muted-foreground")}>
          <ArrowLeft size={15} />
          Retour a DA
        </Link>
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <p className="font-serif text-2xl text-foreground">Livre introuvable</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Ce livre n&apos;est plus present dans cette selection locale.
          </p>
        </div>
      </div>
    );
  }

  const coverUrl = getPreferredCoverUrl({ isbn: book.isbn, coverUrl: book.coverUrl });
  const avgRating = 4.3;
  const totalReviews = 127;
  const ratingDistribution = [
    { stars: 5, pct: 58 },
    { stars: 4, pct: 24 },
    { stars: 3, pct: 11 },
    { stars: 2, pct: 5 },
    { stars: 1, pct: 2 },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/da" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-1 text-muted-foreground")}>
        <ArrowLeft size={15} />
        Retour a DA
      </Link>

      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="mx-auto w-36 shrink-0 sm:mx-0 sm:w-48">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-lg">
            <BookDetailCover title={book.title} author={book.author} coverUrl={coverUrl} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
(book.badge as string) === "Indépendant"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : (book.badge as string) === "Communauté"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    : ""
              )}
            >
              {book.badge}
            </Badge>
            {book.award && (
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                <Award size={12} /> {book.award}
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">{book.title}</h1>
          <p className="text-lg text-muted-foreground">{book.author}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {book.volumeLabel && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} /> {book.volumeLabel}
              </span>
            )}
            {book.year && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> {book.year}
              </span>
            )}
            {book.publisher && (
              <span className="flex items-center gap-1.5">
                <Building2 size={13} /> {book.publisher}
              </span>
            )}
            {book.pages && (
              <span className="flex items-center gap-1.5">
                <FileText size={13} /> {book.pages} pages
              </span>
            )}
          </div>

          {book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.genres.map((genre) => (
                <span key={genre} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className={star <= Math.round(avgRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"} />
              ))}
              <span className="ml-1 font-serif text-xl font-medium">{avgRating}</span>
              <span className="text-sm text-muted-foreground">({totalReviews} avis)</span>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap">
            <button className={cn(buttonVariants({ size: "sm" }), "w-full gap-1.5 border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 sm:w-auto")}>
              <BookMarked size={14} /> Ajouter a ma bibliotheque
            </button>
            <button className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-1.5 sm:w-auto")}>
              <Star size={14} /> Ecrire un avis
            </button>
            <Button type="button" variant="outline" size="sm" onClick={handleOwnerModeToggle} className="w-full gap-1.5 sm:w-auto">
              <KeyRound size={14} /> {isOwnerMode ? "Mode proprietaire actif" : "Mode proprietaire"}
            </Button>
            {book.source === "community" && isOwnerMode && (
              <button
                type="button"
                onClick={() => {
                  const nextBooks = removeCommunityBook(loadCommunityBooks(), book.id);
                  saveCommunityBooks(nextBooks);
                  router.push("/da");
                  router.refresh();
                }}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-1.5 text-destructive hover:text-destructive sm:w-auto")}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {book.description && (
        <>
          <div className="mb-8 max-w-3xl">
            <h2 className="mb-3 flex items-center gap-2 font-serif text-lg">
              <BookOpen size={16} className="text-[var(--accent)]" />
              Resume
            </h2>
            <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">{book.description}</p>
          </div>
          <Separator className="mb-8" />
        </>
      )}

      <Tabs defaultValue="critiques">
        <TabsList variant="line" className="mb-6 h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border pb-0">
          <TabsTrigger value="critiques" className="flex items-center gap-1.5 pb-3">
            <Star size={14} /> Critiques
            <span className="ml-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{totalReviews}</span>
          </TabsTrigger>
          <TabsTrigger value="debats" className="flex items-center gap-1.5 pb-3">
            <MessageSquare size={14} /> Debats
            <span className="ml-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{MOCK_DEBATES.length}</span>
          </TabsTrigger>
          <TabsTrigger value="analyse" className="flex items-center gap-1.5 pb-3">
            <BookOpen size={14} /> Analyse collective
          </TabsTrigger>
        </TabsList>

        <TabsContent value="critiques">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border p-5">
                <p className="mb-4 font-serif text-lg">Distribution</p>
                <div className="space-y-2">
                  {ratingDistribution.map(({ stars, pct }) => (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-right text-muted-foreground">{stars}</span>
                      <Star size={11} className="shrink-0 fill-yellow-500 text-yellow-500" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-yellow-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              {MOCK_REVIEWS.map((review, index) => (
                <div key={index} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-medium text-[var(--accent)]">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.user}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={12} className={star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="debats">
          <div className="space-y-4">
            {MOCK_DEBATES.map((debate) => (
              <div key={debate.question} className="rounded-xl border border-border p-5">
                <p className="font-medium">{debate.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">{debate.votes} votes</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyse">
          <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
            Cette section accueillera les annotations, interpretations et lectures croisees de la communaute.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
