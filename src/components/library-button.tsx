"use client";

import { useState, useEffect, useRef } from "react";
import { Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLibraryStatus, setLibraryStatus, removeFromLibrary,
  type LibraryStatus, STATUS_LABELS, STATUS_EMOJI,
} from "@/lib/library-supabase";
import { createClient } from "@/lib/supabase";

const STATUSES: LibraryStatus[] = ["to_read", "reading", "read"];

export function LibraryButton({ storyId }: { storyId: string }) {
  const [status,   setStatus]   = useState<LibraryStatus | null>(null);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setLoggedIn(true);
      const s = await getLibraryStatus(storyId);
      setStatus(s);
    });
  }, [storyId]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!loggedIn) return null;

  async function choose(s: LibraryStatus) {
    setOpen(false);
    setLoading(true);
    if (status === s) {
      await removeFromLibrary(storyId);
      setStatus(null);
    } else {
      await setLibraryStatus(storyId, s);
      setStatus(s);
    }
    setLoading(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
          status
            ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]"
            : "border-border text-muted-foreground hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
        )}
      >
        {status ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        <span>{status ? `${STATUS_EMOJI[status]} ${STATUS_LABELS[status]}` : "Bibliothèque"}</span>
        <ChevronDown size={12} className={cn("transition-transform", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[160px] rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => choose(s)}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60",
                status === s ? "text-[var(--accent)] font-medium" : "text-foreground"
              )}
            >
              <span>{STATUS_EMOJI[s]}</span>
              {STATUS_LABELS[s]}
              {status === s && <span className="ml-auto text-xs text-muted-foreground">Retirer</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
