"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, BookOpenText, Compass, ImagePlus, Save, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedCover } from "@/components/da/generated-cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GENRE_OPTIONS, type WorkshopFormState, type WorkshopStatus,
} from "@/lib/ateliers";
import { fetchStoryById } from "@/lib/ateliers-supabase";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: WorkshopStatus; label: string }[] = [
  { value: "drafting",  label: "En cours d'ecriture" },
  { value: "finished",  label: "Termine" },
  { value: "rewriting", label: "En reecriture" },
];

const AMBITION_OPTIONS = ["Roman court", "Roman", "Saga", "Novella", "Recueil"];
const TONE_OPTIONS     = ["Intime", "Epique", "Sombre", "Poetique", "Tendu", "Lumineux"];
const AUDIENCE_OPTIONS = ["Adulte", "New adult", "Young adult", "Tout public"];

const EMPTY_FORM: WorkshopFormState = {
  title: "", genre: "", status: "drafting", coverImage: "",
  synopsis: "", chapterCount: "", authorName: "",
  ambition: "", tone: "", audience: "", universeNote: "",
};

export default function ModifierAtelierPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form,        setForm]       = useState<WorkshopFormState>(EMPTY_FORM);
  const [coverFile,   setCoverFile]  = useState<File | null>(null);
  const [submitting,  setSubmitting] = useState(false);
  const [saved,       setSaved]      = useState(false);
  const [loading,     setLoading]    = useState(true);
  const [coverError,  setCoverError] = useState<string | null>(null);

  // Pre-fill form with existing story data
  useEffect(() => {
    if (!bookId) return;
    fetchStoryById(bookId).then((story) => {
      if (!story) { router.replace("/ateliers"); return; }
      setForm({
        title:       story.title,
        genre:       story.genre,
        status:      story.status,
        coverImage:  story.coverImage ?? "",
        synopsis:    story.synopsis ?? "",
        chapterCount: String(story.chapterCount ?? ""),
        authorName:  story.authorName ?? "",
        ambition:    story.ambition ?? "",
        tone:        story.tone ?? "",
        audience:    story.audience ?? "",
        universeNote: story.universeNote ?? "",
      });
      setLoading(false);
    });
  }, [bookId, router]);

  function updateField<K extends keyof WorkshopFormState>(key: K, value: WorkshopFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      updateField("coverImage", typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookId) return;
    setSubmitting(true);

    setCoverError(null);
    const supabase = createClient();
    let hasError = false;
    try {
      let coverUrl: string | undefined = undefined;

      // Upload new cover if a file was selected
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${bookId}/cover.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(path, coverFile, { upsert: true });

        if (uploadError) {
          console.error("[Modifier] uploadError:", uploadError);
          setCoverError(`Erreur upload couverture: ${uploadError.message}`);
          hasError = true;
        } else {
          const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
          coverUrl = urlData.publicUrl;
          console.log("[Modifier] cover uploaded:", coverUrl);
        }
      }

      const { error: updateError } = await supabase
        .from("stories")
        .update({
          title:         form.title.trim(),
          genre:         form.genre,
          status:        form.status,
          description:   form.synopsis.trim() || null,
          author_name:   form.authorName.trim() || null,
          ambition:      form.ambition || null,
          tone:          form.tone || null,
          audience:      form.audience || null,
          universe_note: form.universeNote.trim() || null,
          ...(coverUrl ? { cover_url: coverUrl } : {}),
          updated_at:    new Date().toISOString(),
        })
        .eq("id", bookId);

      if (updateError) {
        console.error("[Modifier] updateError:", updateError);
        if (!hasError) setCoverError(`Erreur sauvegarde: ${updateError.message}`);
        hasError = true;
      }
    } catch (err) {
      console.error("[Modifier] handleSubmit error:", err);
      setCoverError(`Erreur inattendue: ${String(err)}`);
      hasError = true;
    }

    setSubmitting(false);
    if (!hasError) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/ateliers");
        router.refresh();
      }, 1500);
    }
  }

  const previewTitle  = form.title.trim()      || "Ton livre";
  const previewAuthor = form.authorName.trim() || "Atelier";

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );

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
            Modifier le projet
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-border bg-background/88 p-6 shadow-[0_24px_80px_-48px_rgba(54,38,24,0.45)] backdrop-blur dark:bg-card/92 dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
            <div className="mb-8 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <BookOpenText size={13} />
                Modification du livre
              </div>
              <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                Modifie les informations de ton livre
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Toutes les modifications sont enregistrees directement. Le livre reste dans ton atelier avec les memes chapitres et personnages.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Titre du livre</span>
                  <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Le titre de ton manuscrit" className="h-11" required />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium">Nom d&apos;auteur</span>
                  <Input value={form.authorName} onChange={(e) => updateField("authorName", e.target.value)} placeholder="Ton nom d'auteur" className="h-11" />
                </label>
              </div>

              <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <span className="text-sm font-medium">Couverture</span>
                  <div className="overflow-hidden rounded-[1.5rem] border border-border bg-muted/40 p-4 dark:bg-muted/20">
                    <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl shadow-xl">
                      {form.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.coverImage} alt={previewTitle} className="aspect-[2/3] w-full object-cover" />
                      ) : (
                        <div className="aspect-[2/3] w-full">
                          <GeneratedCover title={previewTitle} author={previewAuthor} size="lg" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      <Button type="button" variant="outline" className="w-full justify-center" onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus />
                        {form.coverImage ? "Changer la couverture" : "Ajouter une couverture"}
                      </Button>
                      {form.coverImage && (
                        <Button type="button" variant="ghost" className="w-full justify-center" onClick={() => { updateField("coverImage", ""); setCoverFile(null); }}>
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
                      <Select value={form.genre} onValueChange={(v) => updateField("genre", v ?? "")}>
                        <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Choisir un genre" /></SelectTrigger>
                        <SelectContent align="start">{GENRE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Statut</span>
                      <Select value={form.status} onValueChange={(v) => updateField("status", v as WorkshopStatus)}>
                        <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent align="start">{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Ambition</span>
                      <Select value={form.ambition} onValueChange={(v) => updateField("ambition", v ?? "")}>
                        <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Format du projet" /></SelectTrigger>
                        <SelectContent align="start">{AMBITION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">Ton</span>
                      <Select value={form.tone} onValueChange={(v) => updateField("tone", v ?? "")}>
                        <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Couleur emotionnelle" /></SelectTrigger>
                        <SelectContent align="start">{TONE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium">Public vise</span>
                    <Select value={form.audience} onValueChange={(v) => updateField("audience", v ?? "")}>
                      <SelectTrigger className="h-11 w-full"><SelectValue placeholder="A qui s'adresse ce livre" /></SelectTrigger>
                      <SelectContent align="start">{AUDIENCE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </label>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Note d&apos;intention / Description</span>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => updateField("synopsis", e.target.value)}
                  placeholder="Quelle est la promesse du livre, son coeur narratif, ce que tu veux faire ressentir?"
                  className="min-h-36 rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Univers, contraintes, points de repere</span>
                <textarea
                  value={form.universeNote}
                  onChange={(e) => updateField("universeNote", e.target.value)}
                  placeholder="Le monde, les themes, les regles, les influences ou ce que tu dois garder en tete."
                  className="min-h-28 rounded-xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>

              {coverError && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  ⚠️ {coverError}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm text-muted-foreground">
                  Les modifications sont appliquees immediatement. Tes chapitres et personnages restent intacts.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/ateliers" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
                    Annuler
                  </Link>
                  <Button type="submit" size="lg" disabled={submitting || saved} className={cn("w-full sm:w-auto transition-all", saved ? "bg-emerald-500 hover:bg-emerald-500 text-white" : "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90")}>
                    <Save size={16} />
                    {saved ? "Enregistré ✓" : submitting ? "Enregistrement..." : "Enregistrer"}
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverImage} alt={previewTitle} className="aspect-[2/3] w-full object-cover" />
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
                  {form.genre    && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.genre}</span>}
                  {form.ambition && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.ambition}</span>}
                  {form.tone     && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.tone}</span>}
                  {form.audience && <span className="rounded-full border border-white/15 px-2.5 py-1 text-stone-200">{form.audience}</span>}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
