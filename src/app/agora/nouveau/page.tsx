"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTopic, type AgoraCategorie } from "@/lib/agora-supabase";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const categories: AgoraCategorie[] = [
  "Général", "Théories & Analyses", "Recommandations", "Écriture", "Débats", "Communauté",
];

export default function NouveauSujetPage() {
  const router = useRouter();
  const [user,       setUser]       = useState<User | null>(null);
  const [titre,      setTitre]      = useState("");
  const [contenu,    setContenu]    = useState("");
  const [categorie,  setCategorie]  = useState<AgoraCategorie>("Général");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login");
      else setUser(data.user);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim() || !contenu.trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await createTopic({ titre: titre.trim(), contenu: contenu.trim(), categorie });
    if (result && "id" in result) {
      router.push(`/agora/${result.id}`);
    } else {
      const msg = result && "error" in result ? result.error : "Erreur inconnue";
      setError(`Erreur : ${msg}`);
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 60% 40% at 20% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent)" }}
      />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Back */}
          <Link
            href="/agora"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Retour à l'Agora
          </Link>

          <h1 className="font-serif text-3xl mb-1">Nouveau sujet</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Lancez une discussion, posez une question, partagez une théorie.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Catégorie */}
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2.5 block">
                Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategorie(cat)}
                    className={cn(
                      "rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-150 border",
                      categorie === cat
                        ? "bg-[var(--accent)] text-white border-transparent"
                        : "border-border/60 text-muted-foreground hover:border-[var(--accent)]/40 hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label htmlFor="titre" className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                Titre
              </label>
              <input
                id="titre"
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Un titre clair et précis…"
                maxLength={200}
                className="w-full rounded-xl border border-border/60 bg-card/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{titre.length}/200</p>
            </div>

            {/* Contenu */}
            <div>
              <label htmlFor="contenu" className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                Message
              </label>
              <textarea
                id="contenu"
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                placeholder="Développe ta pensée ici…"
                rows={8}
                maxLength={5000}
                className="w-full rounded-xl border border-border/60 bg-card/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/30 transition-all resize-none leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{contenu.length}/5000</p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/agora" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Annuler
              </Link>
              <Button
                type="submit"
                disabled={submitting || !titre.trim() || !contenu.trim()}
                className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-transparent gap-1.5"
              >
                {submitting ? "Publication…" : <><Send size={14} /> Publier le sujet</>}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
