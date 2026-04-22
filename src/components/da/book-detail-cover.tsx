"use client";

import { useState } from "react";
import { GeneratedCover } from "@/components/da/generated-cover";

interface BookDetailCoverProps {
  title: string;
  author: string;
  coverUrl?: string;
}

export function BookDetailCover({ title, author, coverUrl }: BookDetailCoverProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!coverUrl || imgFailed) {
    return <GeneratedCover title={title} author={author} size="lg" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl}
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setImgFailed(true)}
    />
  );
}
