"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageSquare, MousePointerClick, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GeneratedCover } from "@/components/da/generated-cover";
import { cn } from "@/lib/utils";
import type { BookBadge } from "@/data/curated-books";

interface BookCardProps {
  href?: string;
  onClick?: () => void;
  isbn: string;
  title: string;
  author: string;
  volumeLabel?: string;
  clickCount?: number;
  debateCount?: number;
  year?: number;
  genres?: string[];
  badge: BookBadge | string;
  origin?: "france" | "international" | "community";
  award?: string;
  rating?: number;
  reviewCount?: number;
  coverUrl?: string;
}

export function BookCard({
  href,
  onClick,
  isbn,
  title,
  author,
  volumeLabel,
  clickCount,
  debateCount,
  year,
  genres,
  badge,
  award,
  rating,
  reviewCount,
  coverUrl,
}: BookCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showGenerated = !coverUrl || imgFailed;

  return (
    <Link
      href={href ?? `/da/${isbn}`}
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      {/* Couverture */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {showGenerated ? (
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
            <GeneratedCover title={title} author={author} size="sm" />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Badge superposé */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium shadow-sm",
              badge === "Indépendant"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : badge === "Communauté"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-background/90 text-foreground"
            )}
          >
            {badge}
          </Badge>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        {award && (
          <p className="text-xs text-[var(--accent)] font-medium leading-tight truncate">
            {award}
          </p>
        )}
        <p className="font-serif text-sm font-medium leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{author}</p>
        {volumeLabel && (
          <p className="text-[11px] font-medium text-[var(--accent)]">{volumeLabel}</p>
        )}

        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {rating !== undefined ? (
            <div className="flex items-center gap-1">
              <Star size={11} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Pas encore noté</span>
          )}
          {year && <span className="text-xs text-muted-foreground">{year}</span>}
        </div>

        {(clickCount !== undefined || debateCount !== undefined) && (
          <div className="mt-2 flex flex-col gap-1 border-t border-border/70 pt-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1">
              <MousePointerClick size={11} />
              {clickCount ?? 0} clics
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {debateCount ?? 0} debats
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
