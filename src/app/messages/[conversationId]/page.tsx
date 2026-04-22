"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchMessages, sendMessage, markMessagesRead, fetchConversations,
  type Message,
} from "@/lib/profile-supabase";
import { createClient } from "@/lib/supabase";

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const router = useRouter();

  const [messages,  setMessages]  = useState<Message[]>([]);
  const [myId,      setMyId]      = useState<string | null>(null);
  const [otherName, setOtherName] = useState("...");
  const [draft,     setDraft]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/auth/login"); return; }
      setMyId(data.user.id);

      const [msgs, convs] = await Promise.all([
        fetchMessages(conversationId),
        fetchConversations(),
      ]);
      setMessages(msgs);

      const conv = convs.find((c) => c.id === conversationId);
      if (conv) setOtherName(conv.other_username);
      else { router.replace("/messages"); return; }

      await markMessagesRead(conversationId);
      setLoading(false);
    });
  }, [conversationId, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        markMessagesRead(conversationId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const msg = await sendMessage(conversationId, draft.trim());
    if (msg) setMessages((prev) => [...prev, msg]);
    setDraft("");
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  function formatDay(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Chargement…</p>
    </div>
  );

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const day = new Date(m.created_at).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) last.msgs.push(m);
    else grouped.push({ day, msgs: [m] });
  });

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Link href={`/profil/${encodeURIComponent(otherName)}`}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xs font-semibold text-[var(--accent)]">
            {otherName[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-sm">@{otherName}</span>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {grouped.map(({ day, msgs }) => (
          <div key={day}>
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                {formatDay(msgs[0].created_at)}
              </span>
            </div>
            <div className="space-y-2">
              {msgs.map((msg) => {
                const isMe = msg.sender_id === myId;
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      isMe
                        ? "bg-[var(--accent)] text-white rounded-br-sm"
                        : "bg-muted/60 text-foreground rounded-bl-sm border border-border"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1", isMe ? "text-white/60 text-right" : "text-muted-foreground")}>
                        {formatTime(msg.created_at)}
                        {isMe && msg.read_at && " · Lu"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <p className="text-sm text-muted-foreground">Commencez la conversation avec @{otherName}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écris un message… (Entrée pour envoyer)"
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${t.scrollHeight}px`;
            }}
          />
          <button type="submit" disabled={!draft.trim() || sending}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent)]/90 disabled:opacity-40">
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
