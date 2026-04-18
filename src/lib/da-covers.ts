import type { CuratedBook } from "@/data/curated-books";

interface CoverSourceOptions {
  isbn?: string;
  coverUrl?: string;
}

function normalizeCoverUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  return url.replace("http://", "https://");
}

export function getOpenLibraryCoverUrl(isbn?: string): string | undefined {
  if (!isbn?.trim()) return undefined;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

export function getPreferredCoverUrl({ isbn, coverUrl }: CoverSourceOptions): string | undefined {
  return normalizeCoverUrl(coverUrl) ?? getOpenLibraryCoverUrl(isbn);
}

export function getCuratedBookCoverUrl(book: CuratedBook): string | undefined {
  return getPreferredCoverUrl({
    isbn: book.isbn,
    coverUrl: book.coverUrl,
  });
}
