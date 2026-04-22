"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Library, Star } from "lucide-react";
import { fetchLibrary, removeFromLibrary, setLibraryStatus, type LibraryStory, type LibraryStatus, STATUS_LABELS, STATUS_EMOJI } from "@/lib/library-supabase";
import { GeneratedCover } from "@/components/da/generated-cover";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Tab = "to_read" | "reading" | "read";
const TABS: Tab[] = ["to_read", "reading", "read"];

export default function BibliothequePage() {
  const router = useRouter();
  const [library, setLibrary] = useState<{ to_read: LibraryStory[]; reading: LibraryStory[]; read: LibraryStory[] }>({ to_read: [], reading: [], read: [] });
  const [tab,     setTab]     = useState<Tab>("reading");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return; }
      fetchLibrary().then((lib) => { setLibrary(lib); setLoading(false); });
    });
  }, [router]);

  async function move(story: LibraryStory, newStatus: LibraryStatus) {
    await setLibraryStatus(story.id, newStatus);
    setLibrary((prev) => {
      const updated = { ...prev };
      // Remove from old
      (Object.keys(updated) as Tab[]).forEach((k) => {
        updated[k] = updated[k].filter((s) => s.id !== story.id);
      });
      // Add to new
      updated[newStatus] = [{ ...story, library_status: newStatus }, ...updated[newStatus]];
      return updated;
    });
  }

  async function remove(story: LibraryStory) {
    await removeFromLibrary(story.id);
    setLibrary((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as Tab[]).forEach((k) => {
        updated[k] = updated[k].filter((s) => s.id !== story.id);
      });
      return updated;
    });
  }

  const total = library.to_read.length + library.reading.length + library.read.length;
  const stories = library[tab];

  if (loading) return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-pulse space-y-3">
      {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted/40" />)}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Library size={20} className="text-muted-foreground" />
            <h1 className="font-serif text-2xl">Ma bibliothèque</h1>
            {total > 0 && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{total}</span>}
          </div>
          <Link href="/lire" className="text-xs text-[var(--accent)] hover:underline">Découvrir des histoires →</Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-border">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
                tab === t ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {STATUS_EMOJI[t]} {STATUS_LABELS[t]}
              {library[t].length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{library[t].length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Stories */}
        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/10 py-16 text-center">
            <p className="text-sm text-muted-foreground">{STATUS_EMOJI[tab]} Aucune histoire dans « {STATUS_LABELS[tab]} »</p>
            {tab === "to_read" && (
              <Link href="/lire" className="mt-3 inline-block text-xs text-[var(--accent)] hover:underline">
                Explorer les histoires
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <motion.div key={story.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="group flex gap-4 rounded-2xl border border-border bg-card/40 p-4 transition-all hover:border-[var(--accent)]/30"
              >
                {/* Cover */}
                <Link href={`/lire/${story.id}`} className="shrink-0">
                  <div className="h-20 w-14 overflow-hidden rounded-lg">
                    {story.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.cover_url} alt={story.title} className="h-full w-full object-cover" />
                    ) : (
                      <GeneratedCover title={story.title} author={story.author_name ?? ""} size="sm" />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/lire/${story.id}`}>
                    <p className="font-serif font-medium leading-snug hover:text-[var(--accent)] transition-colors line-clamp-2">{story.title}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {story.author_name && `par ${story.author_name} · `}{story.genre}
                  </p>
                  {story.rating_avg && (
                    <p className="mt-1 flex items-center gap-0.5 text-xs text-amber-400">
                      <Star size={11} className="fill-amber-400" /> {story.rating_avg.toFixed(1)}
                    </p>
                  )}
                  {/* Move buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {TABS.filter((t) => t !== tab).map((t) => (
                      <button key={t} onClick={() => move(story, t)}
                        className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
                        → {STATUS_LABELS[t]}
                      </button>
                    ))}
                    <button onClick={() => remove(story)}
                      className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400">
                      Retirer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
