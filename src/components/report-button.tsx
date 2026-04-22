"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ContentType = "comment" | "reply" | "topic";
type ReportReason = "spam" | "abuse" | "inappropriate" | "other";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam",          label: "Spam ou publicité" },
  { value: "abuse",         label: "Harcèlement ou abus" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "other",         label: "Autre" },
];

interface Props {
  contentType: ContentType;
  contentId: string;
  /** Optional: compact icon-only mode */
  compact?: boolean;
  className?: string;
}

export function ReportButton({ contentType, contentId, compact = true, className }: Props) {
  const [open,    setOpen]    = useState(false);
  const [reason,  setReason]  = useState<ReportReason>("inappropriate");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus("error"); return; }

    const { error } = await supabase.from("reports").insert({
      reporter_id:  user.id,
      content_type: contentType,
      content_id:   contentId,
      reason,
      message: message.trim() || null,
    });

    if (error) { setStatus("error"); return; }
    setStatus("done");
    setTimeout(() => { setOpen(false); setStatus("idle"); setMessage(""); }, 1800);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Signaler ce contenu"
        className={cn(
          "transition-colors",
          compact
            ? "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-amber-500"
            : "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-500",
          className
        )}
      >
        <Flag size={compact ? 12 : 13} />
        {!compact && <span>Signaler</span>}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-serif text-lg">Signaler un contenu</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {status === "done" ? (
              <div className="py-6 text-center">
                <p className="text-sm text-emerald-500 font-medium">✓ Signalement envoyé, merci !</p>
                <p className="mt-1 text-xs text-muted-foreground">Notre équipe examinera ce contenu.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Raison</p>
                  <div className="space-y-2">
                    {REASONS.map(({ value, label }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-[var(--accent)]/40 has-[:checked]:border-[var(--accent)]/60 has-[:checked]:bg-[var(--accent)]/5">
                        <input
                          type="radio"
                          name="reason"
                          value={value}
                          checked={reason === value}
                          onChange={() => setReason(value)}
                          className="accent-[var(--accent)]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Message (optionnel)</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Détails supplémentaires…"
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-destructive">Une erreur est survenue. Connecte-toi d&apos;abord.</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
                  >
                    {status === "sending" ? "Envoi…" : "Signaler"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
