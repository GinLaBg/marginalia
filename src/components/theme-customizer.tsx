"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Accents disponibles ────────────────────────────────────────────────── */

const accents = [
  { key: "theme-violet", label: "Violet",  color: "#7c3aed" },
  { key: "theme-indigo", label: "Indigo",  color: "#4f46e5" },
  { key: "theme-rose",   label: "Rose",    color: "#e879a0" },
  { key: "theme-emerald",label: "Emerald", color: "#059669" },
  { key: "theme-sky",    label: "Ciel",    color: "#0ea5e9" },
  { key: "theme-amber",  label: "Ambre",   color: "#d97706" },
] as const;

/* ─── Fonds disponibles ──────────────────────────────────────────────────── */

const fonds = [
  { key: "fond-noir",  label: "Noir profond",  darkBg: "#0d0d0f", lightBg: "#fafaf9" },
  { key: "fond-bleu",  label: "Gris bleuté",   darkBg: "#0d1117", lightBg: "#f5f7fa" },
  { key: "fond-prune", label: "Prune sombre",  darkBg: "#100d14", lightBg: "#f8f5fc" },
  { key: "fond-encre", label: "Brun encre",    darkBg: "#0f0d0b", lightBg: "#faf8f5" },
  { key: "fond-foret", label: "Vert grisé",    darkBg: "#0c0f0d", lightBg: "#f5f8f5" },
] as const;

type AccentKey = typeof accents[number]["key"];
type FondKey   = typeof fonds[number]["key"];

/* ─── Composant ──────────────────────────────────────────────────────────── */

export function ThemeCustomizer() {
  const [open,       setOpen]       = useState(false);
  const [accent,     setAccent]     = useState<AccentKey>("theme-violet");
  const [fond,       setFond]       = useState<FondKey>("fond-noir");

  // Charger les préférences sauvegardées
  useEffect(() => {
    const savedAccent = localStorage.getItem("mg-accent") as AccentKey | null;
    const savedFond   = localStorage.getItem("mg-fond")   as FondKey   | null;
    if (savedAccent) applyAccent(savedAccent, false);
    if (savedFond)   applyFond(savedFond,     false);
  }, []);

  function applyAccent(key: AccentKey, save = true) {
    // Retirer l'ancien thème accent
    accents.forEach(({ key: k }) => document.documentElement.classList.remove(k));
    document.documentElement.classList.add(key);
    setAccent(key);
    if (save) localStorage.setItem("mg-accent", key);
  }

  function applyFond(key: FondKey, save = true) {
    // Retirer l'ancien fond
    fonds.forEach(({ key: k }) => document.documentElement.classList.remove(k));
    document.documentElement.classList.add(key);
    setFond(key);
    if (save) localStorage.setItem("mg-fond", key);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Personnaliser le thème"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          open ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Palette size={16} />
      </button>

      {open && (
        <>
          {/* Fond de fermeture */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-border bg-popover shadow-xl p-4 space-y-5">
            {/* Accent */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Couleur d'accent</p>
              <div className="flex flex-wrap gap-2">
                {accents.map(({ key, label, color }) => (
                  <button
                    key={key}
                    title={label}
                    onClick={() => applyAccent(key)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all duration-150 ring-offset-background",
                      accent === key ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Fond */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Variante de fond</p>
              <div className="flex flex-col gap-1.5">
                {fonds.map(({ key, label, darkBg }) => (
                  <button
                    key={key}
                    onClick={() => applyFond(key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition-colors text-left",
                      fond === key
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-border/60 shrink-0"
                      style={{ backgroundColor: darkBg }}
                    />
                    {label}
                    {fond === key && <span className="ml-auto text-[var(--accent)]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
