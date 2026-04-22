export const COMMUNITY_BOOKS_STORAGE_KEY = "marginalia-da-community-books";

export interface DABook {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  volumeLabel?: string;
  clickCount?: number;
  debateCount?: number;
  year?: number;
  publisher?: string;
  pages?: number;
  genres: string[];
  badge: "Communauté";
  origin: "community";
  description?: string;
  award?: string;
  coverUrl?: string;
  source: "community";
}

export interface NewCommunityBookInput {
  title: string;
  author: string;
  isbn?: string;
  volumeLabel?: string;
  year?: number;
  publisher?: string;
  genres?: string[];
  description?: string;
  coverUrl?: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function createCommunityBook(input: NewCommunityBookInput): DABook {
  const title = input.title.trim();
  const author = input.author.trim();
  const slugBase = `${slugify(title)}-${slugify(author)}`.replace(/^-+|-+$/g, "");

  return {
    id: `community-${slugBase || "book"}-${Date.now()}`,
    isbn: input.isbn?.trim() || undefined,
    title,
    author,
    volumeLabel: input.volumeLabel?.trim() || undefined,
    clickCount: 0,
    debateCount: 0,
    year: input.year,
    publisher: input.publisher?.trim() || undefined,
    genres: (input.genres ?? []).filter(Boolean),
    description: input.description?.trim() || undefined,
    coverUrl: input.coverUrl?.trim() || undefined,
    badge: "Communauté",
    origin: "community",
    source: "community",
  };
}

function normalizeText(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findDuplicateBook(
  books: DABook[],
  input: Pick<NewCommunityBookInput, "title" | "author" | "isbn" | "volumeLabel">
): DABook | undefined {
  const normalizedIsbn = normalizeText(input.isbn);
  const normalizedTitle = normalizeText(input.title);
  const normalizedAuthor = normalizeText(input.author);
  const normalizedVolume = normalizeText(input.volumeLabel);

  return books.find((book) => {
    if (normalizedIsbn && normalizeText(book.isbn) === normalizedIsbn) {
      return true;
    }

    return (
      normalizeText(book.title) === normalizedTitle &&
      normalizeText(book.author) === normalizedAuthor &&
      normalizeText(book.volumeLabel) === normalizedVolume
    );
  });
}

export function removeCommunityBook(books: DABook[], bookId: string): DABook[] {
  return books.filter((book) => book.id !== bookId);
}

export function incrementCommunityBookClick(books: DABook[], bookId: string): DABook[] {
  return books.map((book) =>
    book.id === bookId
      ? { ...book, clickCount: (book.clickCount ?? 0) + 1 }
      : book
  );
}

export function getBookHref(book: DABook): string {
  return `/da/${book.id}`;
}

export function searchBooksCollection(books: DABook[], query: string): DABook[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return books;

  return books.filter((book) => {
    const haystack = [
      book.title,
      book.author,
      book.volumeLabel,
      book.isbn,
      book.publisher,
      book.description,
      ...book.genres,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function loadCommunityBooks(): DABook[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(COMMUNITY_BOOKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((book): book is DABook => {
      return typeof book?.id === "string" && typeof book?.title === "string" && typeof book?.author === "string";
    });
  } catch {
    return [];
  }
}

export function saveCommunityBooks(books: DABook[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMMUNITY_BOOKS_STORAGE_KEY, JSON.stringify(books));
}

export function findBookById(id: string): DABook | undefined {
  return loadCommunityBooks().find((book) => book.id === id);
}
