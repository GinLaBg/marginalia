import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lire des histoires",
  description:
    "Découvrez des histoires écrites par la communauté Marginalia. Romans, nouvelles, fanfictions — lisez gratuitement.",
  openGraph: {
    title: "Lire des histoires – Marginalia",
    description:
      "Découvrez des histoires écrites par la communauté Marginalia.",
    url: "https://marginalia.app/lire",
  },
  alternates: {
    canonical: "https://marginalia.app/lire",
  },
};

export default function LireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
