"use client";

import { useCallback, useMemo, useState } from "react";
import { BookHeart, KeyRound, Search, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { AddBookSheet } from "@/components/da/add-book-sheet";
import { BookCard } from "@/components/da/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getPreferredCoverUrl } from "@/lib/da-covers";
import {
  getBookHref,
  incrementCommunityBookClick,
  loadCommunityBooks,
  removeCommunityBook,
  saveCommunityBooks,
  searchBooksCollection,
  type DABook,
} from "@/lib/da-books";
import { disableOwnerMode, enableOwnerMode, isOwnerModeEnabled } from "@/lib/da-owner";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function BookSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function DABrowser() {
  const [communityBooks, setCommunityBooks] = useState<DABook[]>(() => loadCommunityBooks());
  const [isOwnerMode, setOwnerMode] = useState(() => isOwnerModeEnabled());
  const [ownerMessage, setOwnerMessage] = useState("");
  const [query, setQuery] = useState("");
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setResults] = useState<DABook[] | null>(null);
  const [debounceTimer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const allBooks = useMemo(() => communityBooks, [communityBooks]);

  const doSearch = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setResults(null);
        setSearching(false);
        return;
      }

      setSearching(true);
      const results = searchBooksCollection(allBooks, value);
      setResults(results);
      setSearching(false);
    },
    [allBooks]
  );

  const handleAddBook = (book: DABook) => {
    const nextBooks = [book, ...communityBooks];
    setCommunityBooks(nextBooks);
    saveCommunityBooks(nextBooks);
    const nextQuery = book.title;
    setQuery(nextQuery);
    setSearching(false);
    setResults(searchBooksCollection(nextBooks, nextQuery));
  };

  const handleDeleteBook = (bookId: string) => {
    if (!isOwnerMode) return;
    const nextBooks = removeCommunityBook(communityBooks, bookId);
    setCommunityBooks(nextBooks);
    saveCommunityBooks(nextBooks);

    if (query.trim()) {
      setResults(searchBooksCollection(nextBooks, query));
      return;
    }

    setResults(null);
  };

  const handleCommunityBookClick = (bookId: string) => {
    const nextBooks = incrementCommunityBookClick(communityBooks, bookId);
    setCommunityBooks(nextBooks);
    saveCommunityBooks(nextBooks);

    if (query.trim()) {
      setResults(searchBooksCollection(nextBooks, query));
    }
  };

  const handleOwnerModeToggle = () => {
    if (isOwnerMode) {
      disableOwnerMode();
      setOwnerMode(false);
      setOwnerMessage("Mode proprietaire desactive.");
      return;
    }

    const pin = window.prompt("Entrez le code proprietaire pour activer la suppression");
    if (!pin) return;

    const unlocked = enableOwnerMode(pin);
    if (unlocked) {
      setOwnerMode(true);
      setOwnerMessage("Mode proprietaire active.");
      return;
    }

    setOwnerMessage("Code proprietaire incorrect.");
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value.trim()) {
      setResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => doSearch(value), 350);
    setTimer(timer);
  };

  const isSearchMode = query.trim().length > 0;

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xl flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Titre, auteur, ISBN..."
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            className="h-11 pl-9 pr-9 text-sm"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setQuery("");
                  setResults(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Effacer"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={handleOwnerModeToggle} className="w-full sm:w-auto">
            <KeyRound />
            {isOwnerMode ? "Mode proprietaire actif" : "Mode proprietaire"}
          </Button>
          <AddBookSheet existingBooks={allBooks} onAddBook={handleAddBook} />
        </div>
      </div>

      {ownerMessage && (
        <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {ownerMessage}
        </div>
      )}

      {communityBooks.length > 0 && !isSearchMode && (
        <div className="mb-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl text-foreground">Ajouts de la communaute</p>
              <p className="text-sm text-muted-foreground">
                {isOwnerMode
                  ? "La suppression est disponible en mode proprietaire sur ce navigateur."
                  : "La suppression est reservee au mode proprietaire."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {communityBooks.map((book) => (
              <div key={book.id} className="space-y-2">
                <BookCard
                  href={getBookHref(book)}
                  onClick={() => handleCommunityBookClick(book.id)}
                  isbn={book.isbn ?? book.id}
                  title={book.title}
                  author={book.author}
                  volumeLabel={book.volumeLabel}
                  clickCount={book.clickCount}
                  debateCount={book.debateCount}
                  year={book.year}
                  genres={book.genres}
                  badge={book.badge}
                  coverUrl={getPreferredCoverUrl({ isbn: book.isbn, coverUrl: book.coverUrl })}
                />
                {isOwnerMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBook(book.id)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 size={12} />
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isSearchMode && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-24 text-center"
          >
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-border">
              <BookHeart size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-2 font-serif text-xl text-foreground">Cherchez ou ajoutez un livre</p>
            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
              Entrez un titre, un auteur, un ISBN ou un genre. La communaute peut aussi enrichir la selection avec ses coups de coeur.
            </p>
          </motion.div>
        )}

        {isSearchMode && isSearching && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <BookSkeleton key={index} />
            ))}
          </motion.div>
        )}

        {isSearchMode && !isSearching && searchResults && searchResults.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-5 text-sm text-muted-foreground">
              {searchResults.length} resultat{searchResults.length > 1 ? "s" : ""} pour <strong>&ldquo;{query}&rdquo;</strong>
            </p>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {searchResults.map((book) => (
                <motion.div key={book.id} variants={fadeUp} className="space-y-2">
                  <BookCard
                    href={getBookHref(book)}
                    onClick={book.source === "community" ? () => handleCommunityBookClick(book.id) : undefined}
                    isbn={book.isbn ?? book.id}
                    title={book.title}
                    author={book.author}
                    volumeLabel={book.volumeLabel}
                    clickCount={book.source === "community" ? book.clickCount : undefined}
                    debateCount={book.source === "community" ? book.debateCount : undefined}
                    year={book.year}
                    genres={book.genres}
                    badge={book.badge}
                    award={book.award}
                    coverUrl={getPreferredCoverUrl({ isbn: book.isbn, coverUrl: book.coverUrl })}
                  />
                  {isOwnerMode && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book.id)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 size={12} />
                      Supprimer
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {isSearchMode && !isSearching && searchResults !== null && searchResults.length === 0 && (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center"
          >
            <p className="mb-2 font-serif text-xl">Aucun resultat</p>
            <p className="text-sm text-muted-foreground">Essayez un autre titre ou ajoutez ce livre a la DA.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
