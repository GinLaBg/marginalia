"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GeneratedCover } from "@/components/da/generated-cover";
import { createCommunityBook, findDuplicateBook, type DABook } from "@/lib/da-books";

const BOOKTOK_GENRES = [
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
  "Development personnel",
  "Memoire",
];

interface AddBookSheetProps {
  existingBooks: DABook[];
  onAddBook: (book: DABook) => void;
}

interface FormState {
  title: string;
  author: string;
  isbn: string;
  volumeLabel: string;
  year: string;
  publisher: string;
  genre: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  author: "",
  isbn: "",
  volumeLabel: "",
  year: "",
  publisher: "",
  genre: "",
  description: "",
};

const VOLUME_OPTIONS = [
  "One-shot",
  "Tome 1",
  "Tome 2",
  "Tome 3",
  "Tome 4",
  "Tome 5",
  "Tome 6",
  "Tome 7",
  "Tome 8",
];

export function AddBookSheet({ existingBooks, onAddBook }: AddBookSheetProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  const previewTitle = form.title.trim() || "Titre du livre";
  const previewAuthor = form.author.trim() || "Nom auteur";
  const duplicateBook = useMemo(
    () =>
      findDuplicateBook(existingBooks, {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        volumeLabel: form.volumeLabel,
      }),
    [existingBooks, form.author, form.isbn, form.title, form.volumeLabel]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrorMessage("");
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setErrorMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (duplicateBook) {
      setErrorMessage("Le livre a deja ete ajoute.");
      return;
    }

    const book = createCommunityBook({
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      volumeLabel: form.volumeLabel,
      year: form.year ? Number(form.year) : undefined,
      publisher: form.publisher,
      genres: form.genre ? [form.genre] : [],
      description: form.description,
    });

    onAddBook(book);
    resetForm();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90" />
        }
      >
        <Plus />
        Ajouter un livre
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>Ajouter un livre aime</SheetTitle>
          <SheetDescription>
            Ajoute un coup de coeur de la communaute. Si aucune couverture n&apos;est disponible, Marginalia en genere une automatiquement.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-5 pb-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
                <div className="aspect-[2/3] w-full max-w-[180px]">
                  <GeneratedCover title={previewTitle} author={previewAuthor} size="lg" />
                </div>
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Sparkles size={14} className="text-[var(--accent)]" />
                    Apercu de la couverture generee
                  </div>
                  <p className="mt-1">
                    Ce visuel sera utilise automatiquement si aucune image legale n&apos;est fournie.
                  </p>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Titre</span>
                <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Le Nom du vent" required />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Auteur</span>
                <Input value={form.author} onChange={(event) => updateField("author", event.target.value)} placeholder="Patrick Rothfuss" required />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">ISBN optionnel</span>
                  <Input value={form.isbn} onChange={(event) => updateField("isbn", event.target.value)} placeholder="978..." />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">Format</span>
                  <Select value={form.volumeLabel} onValueChange={(value) => updateField("volumeLabel", value ?? "")}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="One-shot ou tome" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {VOLUME_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Annee</span>
                  <Input type="number" min="0" max="2100" value={form.year} onChange={(event) => updateField("year", event.target.value)} placeholder="2007" />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Editeur</span>
                <Input value={form.publisher} onChange={(event) => updateField("publisher", event.target.value)} placeholder="Bragelonne" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Genre</span>
                <Select value={form.genre} onValueChange={(value) => updateField("genre", value ?? "")}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Choisir un genre" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {BOOKTOK_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Pourquoi ce livre merite d&apos;etre la</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Quelques lignes sur ce que le livre apporte a la communaute."
                  className="min-h-28 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              {duplicateBook && form.title.trim() && form.author.trim() && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Le livre a deja ete ajoute.
                </p>
              )}

              {errorMessage && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t border-border bg-popover pt-4">
            <Button
              type="submit"
              disabled={Boolean(duplicateBook)}
              className="bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
            >
              Ajouter a la DA
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
