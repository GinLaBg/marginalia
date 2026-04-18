"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, BookOpenText, Compass, ImagePlus, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneratedCover } from "@/components/da/generated-cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createWorkshopBook,
  GENRE_OPTIONS,
  INITIAL_WORKSHOP_FORM,
  loadWorkshopBooks,
  saveWorkshopBooks,
  type WorkshopFormState,
  type WorkshopStatus,
} from "@/lib/ateliers";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: WorkshopStatus; label: string; description: string }[] = [
  { value: "drafting", label: "En cours d'ecriture", description: "Pour les projets vivants et encore en construction." },
  { value: "finished", label: "Termine", description: "Pour les manuscrits boucles et prets a etre relus." },
  { value: "rewriting", label: "En reecriture", description: "Pour les textes que tu reprends en profondeur." },
];

const AMBITION_OPTIONS = [
  "Roman court",
  "Roman",
  "Saga",
  "Novella",
  "Recueil",
];

const TONE_OPTIONS = [
  "Intime",
  "Epique",
  "Sombre",
  "Poetique",
  "Tendu",
  "Lumineux",
];

const AUDIENCE_OPTIONS = [
  "Adulte",
  "New adult",
  "Young adult",
  "Tout public",
];

export default function NewAtelierBookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<WorkshopFormState>(INITIAL_WORKSHOP_FORM);

  const previewTitle = form.title.trim() || "Ton nouveau livre";
  const previewAuthor = form.authorName.trim() || "Atelier";

  function updateField<K extends keyof WorkshopFormState>(key: K, value: WorkshopFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateField("coverImage", result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newBook = createWorkshopBook(form);
    const nextBooks = [newBook, ...loadWorkshopBooks()];
    saveWorkshopBooks(nextBooks);
    router.push(`/ateliers/${newBook.id}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(191,145,93,0.18),_transparent_28%),linear-gradient(180deg,_rgba(250,246,238,0.95),_rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(191,145,93,0.12),_transparent_24%),linear-gradient(180deg,_rgba(12,12,14,1),_rgba(6,6,8,1))]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Link href="/ateliers" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
            <ArrowLeft size={14} />
            Retour aux ateliers
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles size={12} />
            Nouveau projet
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-border bg-background/88 p-6 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.45)] backdrop-blur dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
            <div className="mb-8 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <BookOpenText size={13} />
                Espace de creation
              </div>
              <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-5xl">
                Construis ton livre comme un vrai workspace d&apos;auteur
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Cette page est faite pour poser les fondations du projet: identite, ambition, ton, cible, statut et
                note d&apos;intention. Une fois valide, ton livre rejoint directement ton atelier personnel.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Titre du livre</span>
                  <Input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Le titre de ton manuscrit"
                    className="h-11"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">Nom d&apos;auteur</span>
                  <Input
                    value={form.authorName}
                    onChange={(event) => updateField("authorName", event.target.value)}
                    placeholder="Ton nom d'auteur"
                    className="h-11"
                  />
                </label>
              </div>

              <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <span className="text-sm font-medium">Couverture</span>
                  <div className="overflow-hidden rounded-[1.5rem] border border-border bg-muted/40 p-4 dark:bg-muted/20">
                    <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl shadow-xl">
                      {form.coverImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={form.coverImage}
                          alt={previewTitle}
                          className="aspect-[2/3] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[2/3] w-full">
                          <GeneratedCover title={previewTitle} author={previewAuthor} size="lg" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus />
                        {form.coverImage ? "Changer la couverture" : "Ajouter une couverture"}
                      </Button>
                      {form.coverImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-center"
                          onClick={() => updateField("coverImage", "")}
                        >
                          Retirer la couverture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid min-w-0 gap-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Genre</span>
                      <Select value={form.genre} onValueChange={(value) => updateField("genre", value ?? "")}>
                        <SelectTrigger className="h-11 w-full min-w-0">
                          <SelectValue placeholder="Choisir un genre" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {GENRE_OPTIONS.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Statut</span>
                      <Select value={form.status} onValueChange={(value) => updateField("status", value as WorkshopStatus)}>
                        <SelectTrigger className="h-11 w-full min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Ambition</span>
                      <Select value={form.ambition} onValueChange={(value) => updateField("ambition", value ?? "")}>
                        <SelectTrigger className="h-11 w-full min-w-0">
                          <SelectValue placeholder="Format du projet" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {AMBITION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Chapitres prevus</span>
                      <Input
                        type="number"
                        min="0"
                        value={form.chapterCount}
                        onChange={(event) => updateField("chapterCount", event.target.value)}
                        placeholder="0"
                        className="h-11"
                      />
                    </label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Ton</span>
                      <Select value={form.tone} onValueChange={(value) => updateField("tone", value ?? "")}>
                        <SelectTrigger className="h-11 w-full min-w-0">
                          <SelectValue placeholder="Choisir une couleur emotionnelle" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {TONE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Public vise</span>
                      <Select value={form.audience} onValueChange={(value) => updateField("audience", value ?? "")}>
                        <SelectTrigger className="h-11 w-full min-w-0">
                          <SelectValue placeholder="A qui s'adresse ce livre" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {AUDIENCE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Note d&apos;intention</span>
                <textarea
                  value={form.synopsis}
                  onChange={(event) => updateField("synopsis", event.target.value)}
                  placeholder="Quelle est la promesse du livre, son coeur narratif, ce que tu veux faire ressentir?"
                  className="min-h-36 rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Univers, contraintes, points de repere</span>
                <textarea
                  value={form.universeNote}
                  onChange={(event) => updateField("universeNote", event.target.value)}
                  placeholder="Le monde, les themes, les regles, les influences ou ce que tu dois garder en tete."
                  className="min-h-28 rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm text-muted-foreground">
                  Une fois cree, ton livre s&apos;ouvre directement dans ton espace d&apos;ecriture pour commencer le chapitre 1.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/ateliers" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
                    Annuler
                  </Link>
                  <Button type="submit" size="lg" className="w-full bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 sm:w-auto">
                    <Plus />
                    Creer le livre
                  </Button>
                </div>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-border bg-[#201814] p-6 text-stone-100 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.65)] dark:bg-[#08090b]">
              <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-300">
                <Compass size={13} />
                Apercu du projet
              </div>
              <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl shadow-2xl">
                {form.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.coverImage}
                    alt={previewTitle}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <GeneratedCover title={previewTitle} author={previewAuthor} size="lg" />
                )}
              </div>
              <div className="mt-5 space-y-3">
                <div>
                  <p className="font-serif text-2xl leading-tight">{previewTitle}</p>
                  <p className="mt-1 text-sm text-stone-300">{previewAuthor}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {form.genre && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.genre}</span>}
                  {form.ambition && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.ambition}</span>}
                  {form.tone && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.tone}</span>}
                  {form.audience && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.audience}</span>}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-background/88 p-6 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.35)] dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
              <p className="mb-4 font-serif text-2xl text-foreground">Page vraiment personnalisable</p>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>Tu peux ici definir l&apos;identite de ton projet avant meme d&apos;ecrire le premier chapitre.</p>
                <p>Le but est que cette page serve de base de travail: genre, ton, cible, ambition narrative, univers et statut.</p>
                <p>Une fois le projet cree, tu arrives sur une vraie page d&apos;ecriture simple avec navigation des chapitres et personnages a cote.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
