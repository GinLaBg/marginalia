export const ATELIERS_STORAGE_KEY = "marginalia-ateliers-books";

export type WorkshopStatus = "drafting" | "finished" | "rewriting" | "ongoing";

export interface WorkshopChapter {
  id: string;
  title: string;
  content: string;
  is_published?: boolean;
}

export interface WorkshopCharacter {
  id: string;
  name: string;
  role: string;
  notes: string;
}

export interface WorkshopBook {
  id: string;
  title: string;
  genre: string;
  status: WorkshopStatus;
  coverImage?: string;
  synopsis?: string;
  chapterCount: number;
  updatedAt: string;
  authorName?: string;
  ambition?: string;
  tone?: string;
  audience?: string;
  universeNote?: string;
  coverSeed?: string;
  isPublished?: boolean;
  chapters: WorkshopChapter[];
  characters: WorkshopCharacter[];
}

export type ContentType = "original" | "fanfiction";

export interface WorkshopFormState {
  title: string;
  genre: string;
  status: WorkshopStatus;
  coverImage: string;
  synopsis: string;
  chapterCount: string;
  authorName: string;
  ambition: string;
  tone: string;
  audience: string;
  universeNote: string;
  contentType: ContentType;
  fanfictionSource: string; // "Titre — Auteur" si fanfiction
  rightsConfirmed: boolean;
}

export const GENRE_OPTIONS = [
  "Romance",
  "Dark romance",
  "Romantasy",
  "Fantasy",
  "Young adult",
  "New adult",
  "Thriller",
  "Mystere",
  "Fantasy cosy",
  "Science-fiction",
  "Classique",
  "Litterature contemporaine",
];

export const INITIAL_WORKSHOP_FORM: WorkshopFormState = {
  title: "",
  genre: "",
  status: "drafting",
  coverImage: "",
  synopsis: "",
  chapterCount: "",
  authorName: "",
  ambition: "",
  tone: "",
  audience: "",
  universeNote: "",
  contentType: "original",
  fanfictionSource: "",
  rightsConfirmed: false,
};

export function loadWorkshopBooks(): WorkshopBook[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ATELIERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((book): book is WorkshopBook => {
        return (
          typeof book?.id === "string" &&
          typeof book?.title === "string" &&
          typeof book?.genre === "string" &&
          typeof book?.status === "string"
        );
      })
      .map((book) => ({
        ...book,
        chapters: Array.isArray(book.chapters) && book.chapters.length > 0
          ? book.chapters
              .filter((chapter): chapter is WorkshopChapter => (
                typeof chapter?.id === "string" &&
                typeof chapter?.title === "string" &&
                typeof chapter?.content === "string"
              ))
          : [
              {
                id: `${book.id}-chapter-1`,
                title: "Chapitre 1",
                content: "",
              },
            ],
        characters: Array.isArray(book.characters)
          ? book.characters.filter((character): character is WorkshopCharacter => (
              typeof character?.id === "string" &&
              typeof character?.name === "string" &&
              typeof character?.role === "string" &&
              typeof character?.notes === "string"
            ))
          : [],
      }));
  } catch {
    return [];
  }
}

export function saveWorkshopBooks(books: WorkshopBook[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATELIERS_STORAGE_KEY, JSON.stringify(books));
}

export function formatWorkshopDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function createWorkshopBook(form: WorkshopFormState): WorkshopBook {
  const id = `atelier-${Date.now()}`;

  return {
    id,
    title: form.title.trim(),
    genre: form.genre,
    status: form.status,
    coverImage: form.coverImage || undefined,
    synopsis: form.synopsis.trim() || undefined,
    chapterCount: Number(form.chapterCount) || 0,
    updatedAt: new Date().toISOString(),
    authorName: form.authorName.trim() || undefined,
    ambition: form.ambition.trim() || undefined,
    tone: form.tone.trim() || undefined,
    audience: form.audience.trim() || undefined,
    universeNote: form.universeNote.trim() || undefined,
    coverSeed: `${form.title.trim()}::${form.authorName.trim() || "atelier"}`,
    chapters: [
      {
        id: `${id}-chapter-1`,
        title: "Chapitre 1",
        content: "",
      },
    ],
    characters: [],
  };
}

export function countChapterWords(content: string): number {
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}
