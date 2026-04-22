"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFollowing, follow, unfollow } from "@/lib/profile-supabase";
import { createClient } from "@/lib/supabase";

interface Props {
  targetUserId: string;
  targetUsername?: string;
  compact?: boolean; // small pill style for inline use
}

export function FollowButton({ targetUserId, compact = false }: Props) {
  const [following, setFollowing] = useState(false);
  const [myId,      setMyId]      = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setMyId(data.user.id);
      const f = await isFollowing(data.user.id, targetUserId);
      setFollowing(f);
    });
  }, [targetUserId]);

  if (!myId || myId === targetUserId) return null;

  async function toggle() {
    setLoading(true);
    if (following) { await unfollow(targetUserId); setFollowing(false); }
    else           { await follow(targetUserId);   setFollowing(true);  }
    setLoading(false);
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
          following
            ? "border-border text-muted-foreground hover:border-red-400/40 hover:text-red-400"
            : "border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10"
        )}
      >
        {following ? <><UserCheck size={11} /> Abonné</> : <><UserPlus size={11} /> Suivre</>}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
        following
          ? "border border-border text-muted-foreground hover:border-red-400/50 hover:text-red-400"
          : "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
      )}
    >
      {following ? <><UserCheck size={14} /> Abonné</> : <><UserPlus size={14} /> S&apos;abonner</>}
    </button>
  );
}
