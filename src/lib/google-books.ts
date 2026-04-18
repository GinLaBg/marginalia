export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export async function searchBooks(query: string, maxResults = 20): Promise<GoogleBook[]> {
  if (!query.trim()) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function getBookByISBN(isbn: string): Promise<GoogleBook | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function getBookById(id: string): Promise<GoogleBook | null> {
  const url = `https://www.googleapis.com/books/v1/volumes/${id}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Retourne l'URL de couverture la plus fiable pour un livre */
export function getCoverUrl(isbn?: string, googleBook?: GoogleBook): string {
  // Priorité 1 : Open Library par ISBN (fiable, haute résolution)
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  // Priorité 2 : Google Books thumbnail (HTTPS)
  const thumb = googleBook?.volumeInfo?.imageLinks?.thumbnail
    ?? googleBook?.volumeInfo?.imageLinks?.smallThumbnail;
  if (thumb) return thumb.replace("http://", "https://");
  return "/cover-placeholder.svg";
}

export function getISBN13(book: GoogleBook): string | undefined {
  return book.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;
}
