"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Check, Loader2, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  fetchMyProfile,
  fetchPreferences,
  savePreferences,
  upsertProfile,
  type UserPreferences,
} from "@/lib/profile-supabase";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

interface Toggle {
  key: keyof UserPreferences;
  label: string;
  description: string;
}

const TOGGLES: Toggle[] = [
  { key: "show_drafts",         label: "Afficher les brouillons",          description: "Les histoires en brouillon seront visibles sur ton profil public." },
  { key: "show_ongoing",        label: "Afficher les histoires en cours",  description: "Les histoires avec le statut « en cours » apparaissent sur ton profil." },
  { key: "show_finished",       label: "Afficher les histoires terminées", description: "Les histoires terminées sont visibles publiquement." },
  { key: "show_agora_activity", label: "Afficher l'activité Agora",        description: "Tes sujets et réponses sur l'Agora apparaissent dans ton profil." },
];

export default function ParametresPage() {
  const router = useRouter();

  const [bio,          setBio]          = useState("");
  const [username,     setUsername]     = useState("");
  const [bannerColor,  setBannerColor]  = useState("#7c3aed");
  const [links,        setLinks]        = useState<{ label: string; url: string }[]>([]);
  const [prefs,        setPrefs]        = useState<UserPreferences>({
    show_drafts: false,
    show_ongoing: true,
    show_finished: true,
    show_agora_activity: true,
    featured_stories: [],
  });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      const [profile, userPrefs] = await Promise.all([
        fetchMyProfile(),
        fetchPreferences(user.id),
      ]);

      if (profile) {
        setBio(profile.bio ?? "");
        setUsername(profile.username ?? "");
        setBannerColor(profile.banner_color ?? "#7c3aed");
        setLinks(Array.isArray(profile.links) ? profile.links : []);
      }
      setPrefs(userPrefs);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const [profileOk, prefsOk] = await Promise.all([
      upsertProfile({ bio, username, banner_color: bannerColor, links }),
      savePreferences(prefs),
    ]);

    setSaving(false);
    if (!profileOk || !prefsOk) {
      setError("Une erreur est survenue. Verifie que le nom d'utilisateur est unique.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function togglePref(key: keyof UserPreferences) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={20} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <motion.div variants={stagger} initial="hidden" animate="show">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <Settings size={18} className="text-muted-foreground" />
            <h1 className="font-serif text-2xl">Paramètres du profil</h1>
          </div>
          <p className="text-sm text-muted-foreground">Personnalise ce que les autres voient sur ton profil public.</p>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-8">

          {/* Identité */}
          <motion.section variants={fadeUp} className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Identité</p>

            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ton_pseudo"
                maxLength={32}
                className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--accent)]/50 focus:bg-background"
              />
              <p className="text-xs text-muted-foreground">Ton profil sera accessible à /profil/{username || "…"}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="block text-sm font-medium">
                Biographie
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quelques mots sur toi…"
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--accent)]/50 focus:bg-background"
              />
              <p className="text-right text-xs text-muted-foreground">{bio.length}/500</p>
            </div>

            {/* Couleur de bannière */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Couleur de bannière</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bannerColor}
                  onChange={(e) => setBannerColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                />
                <div className="flex-1 h-10 rounded-xl border border-border overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${bannerColor}66, ${bannerColor}22)` }} />
              </div>
            </div>

            {/* Liens */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Liens (réseaux, portfolio…)</label>
              {links.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={l.label} onChange={(e) => setLinks((prev) => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                    placeholder="Label" className="w-28 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/50" />
                  <input value={l.url} onChange={(e) => setLinks((prev) => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                    placeholder="https://..." className="flex-1 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/50" />
                  <button type="button" onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">✕</button>
                </div>
              ))}
              {links.length < 5 && (
                <button type="button" onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
                  className="text-xs text-[var(--accent)] hover:underline">+ Ajouter un lien</button>
              )}
            </div>
          </motion.section>

          {/* Visibilité */}
          <motion.section variants={fadeUp} className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Visibilité</p>
            <div className="space-y-3">
              {TOGGLES.map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/60 px-4 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePref(key)}
                    className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: prefs[key] ? "var(--accent)" : "hsl(var(--border))" }}
                    aria-checked={!!prefs[key]}
                    role="switch"
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{ transform: prefs[key] ? "translateX(16px)" : "translateX(2px)" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Feedback + Submit */}
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                <Check size={14} /> Modifications sauvegardées.
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--accent)]/90 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
}
