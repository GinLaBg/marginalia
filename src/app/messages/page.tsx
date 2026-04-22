"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { fetchConversations, type Conversation } from "@/lib/profile-supabase";
import { createClient } from "@/lib/supabase";

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "à l'instant";
  if (d < 3600) return `${Math.floor(d / 60)}min`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [convs,   setConvs]   = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId,    setMyId]    = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return; }
      setMyId(data.user.id);
      fetchConversations().then((c) => { setConvs(c); setLoading(false); });
    });
  }, [router]);

  if (loading) return (
    <div className="mx-auto max-w-xl px-4 py-12 animate-pulse space-y-3">
      {[1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted/40" />)}
    </div>
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <div className="mb-8 flex items-center gap-2.5">
          <MessageCircle size={20} className="text-muted-foreground" />
          <h1 className="font-serif text-2xl">Messages</h1>
        </div>

        {convs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/10 py-16 text-center">
            <MessageCircle size={28} className="mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Pas encore de conversations.</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">
              Va sur un profil pour envoyer un message.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {convs.map((conv) => (
              <Link key={conv.id} href={`/messages/${conv.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 px-4 py-3.5 transition-all hover:border-[var(--accent)]/30 hover:-translate-y-0.5">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-sm font-semibold text-[var(--accent)]">
                  {conv.other_username[0].toUpperCase()}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-sm">@{conv.other_username}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(conv.last_message_at)}</span>
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
                  )}
                </div>
                {/* Unread badge */}
                {(conv.unread ?? 0) > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
