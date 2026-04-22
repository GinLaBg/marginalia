"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchNotifications, countUnread, markAllRead, type Notification } from "@/lib/notifications-supabase";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "à l'instant";
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

const typeIcon: Record<string, string> = {
  comment:     "💬",
  follow:      "👤",
  agora_reply: "🗣️",
  review:      "⭐",
};

export function NotificationsBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread,        setUnread]        = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    countUnread().then(setUnread);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchNotifications().then((data) => {
      setNotifications(data);
      setUnread(0);
      markAllRead();
    });
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          open ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Notifications</p>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={20} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">Pas encore de notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 transition-colors",
                      !n.is_read ? "bg-[var(--accent)]/5" : "hover:bg-secondary/40"
                    )}
                  >
                    {n.content_url ? (
                      <Link href={n.content_url} onClick={() => setOpen(false)} className="flex items-start gap-2.5">
                        <span className="text-base shrink-0 mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0 mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
