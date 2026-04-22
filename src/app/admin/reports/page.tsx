"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Flag, Trash2, Eye, EyeOff, CheckCircle, XCircle, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = "open" | "reviewed" | "resolved" | "ignored";

interface Report {
  id: string;
  reporter_id: string;
  content_type: "comment" | "reply" | "topic";
  content_id: string;
  reason: string;
  message: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  open:     "text-amber-500 bg-amber-500/10 border-amber-500/30",
  reviewed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  resolved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  ignored:  "text-muted-foreground bg-secondary border-border",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  open:     "Ouvert",
  reviewed: "Examiné",
  resolved: "Résolu",
  ignored:  "Ignoré",
};

const REASON_LABELS: Record<string, string> = {
  spam:          "Spam",
  abuse:         "Harcèlement",
  inappropriate: "Contenu inapproprié",
  other:         "Autre",
};

const CONTENT_LABELS: Record<string, string> = {
  comment: "Commentaire",
  reply:   "Réponse Agora",
  topic:   "Sujet Agora",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `il y a ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports,   setReports]   = useState<Report[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<ReportStatus | "all">("open");
  const [busy,      setBusy]      = useState<string | null>(null);

  // ── Guard: only admins / mods / super_admin ─────────────────────────────────
  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["admin", "super_admin", "moderator"].includes(profile.role)) {
        router.replace("/");
      }
    }
    checkAccess();
  }, [router]);

  // ── Load reports ─────────────────────────────────────────────────────────────
  const loadReports = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setReports(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadReports(); }, [loadReports]);

  // ── Update report status ──────────────────────────────────────────────────
  async function updateStatus(reportId: string, newStatus: ReportStatus) {
    setBusy(reportId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("reports").update({
      status:      newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id ?? null,
    }).eq("id", reportId);
    setReports((prev) =>
      prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r)
    );
    setBusy(null);
  }

  // ── Delete flagged content ─────────────────────────────────────────────────
  async function deleteContent(report: Report) {
    if (!confirm(`Supprimer ce ${CONTENT_LABELS[report.content_type].toLowerCase()} définitivement ?`)) return;
    setBusy(report.id);
    const supabase = createClient();
    await supabase.rpc("admin_delete_content", {
      p_content_type: report.content_type,
      p_content_id:   report.content_id,
    });
    await updateStatus(report.id, "resolved");
  }

  const counts = {
    all:      reports.length,
    open:     reports.filter((r) => r.status === "open").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    ignored:  reports.filter((r) => r.status === "ignored").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag size={20} className="text-amber-500" />
          <h1 className="font-serif text-2xl">Signalements</h1>
        </div>
        <button
          onClick={loadReports}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "open", "reviewed", "resolved", "ignored"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-all",
              filter === s
                ? "bg-[var(--accent)] text-white border-transparent"
                : "border-border text-muted-foreground hover:border-[var(--accent)]/40 hover:text-foreground"
            )}
          >
            {s === "all" ? "Tous" : STATUS_LABELS[s]}
            <span className="ml-1.5 opacity-60">
              {s === "all" ? reports.length : counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Flag size={24} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Aucun signalement{filter !== "all" ? ` « ${STATUS_LABELS[filter as ReportStatus]} »` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card/40 px-5 py-4 transition-colors hover:border-border/80"
            >
              {/* Row 1: meta */}
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("rounded-full border px-2 py-0.5 font-medium", STATUS_COLORS[report.status])}>
                  {STATUS_LABELS[report.status]}
                </span>
                <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5">
                  {CONTENT_LABELS[report.content_type]}
                </span>
                <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5">
                  {REASON_LABELS[report.reason] ?? report.reason}
                </span>
                <span className="ml-auto">{timeAgo(report.created_at)}</span>
              </div>

              {/* Row 2: content ID + message */}
              <p className="mb-1 font-mono text-[11px] text-muted-foreground/60 break-all">
                ID : {report.content_id}
              </p>
              {report.message && (
                <p className="mb-3 rounded-lg bg-secondary/30 px-3 py-2 text-sm italic text-muted-foreground">
                  « {report.message} »
                </p>
              )}

              {/* Row 3: actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {report.status === "open" && (
                  <button
                    disabled={busy === report.id}
                    onClick={() => updateStatus(report.id, "reviewed")}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-400/30 px-3 py-1.5 text-xs text-blue-400 transition-colors hover:bg-blue-400/10 disabled:opacity-50"
                  >
                    <Eye size={12} /> Marquer examiné
                  </button>
                )}
                {(report.status === "open" || report.status === "reviewed") && (
                  <button
                    disabled={busy === report.id}
                    onClick={() => updateStatus(report.id, "ignored")}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                  >
                    <EyeOff size={12} /> Ignorer
                  </button>
                )}
                {report.status !== "resolved" && (
                  <button
                    disabled={busy === report.id}
                    onClick={() => deleteContent(report)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-400/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Supprimer le contenu
                  </button>
                )}
                {report.status !== "resolved" && (
                  <button
                    disabled={busy === report.id}
                    onClick={() => updateStatus(report.id, "resolved")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-500 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    <CheckCircle size={12} /> Résoudre sans supprimer
                  </button>
                )}
                {report.status === "resolved" || report.status === "ignored" ? (
                  <button
                    disabled={busy === report.id}
                    onClick={() => updateStatus(report.id, "open")}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                  >
                    <XCircle size={12} /> Rouvrir
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
