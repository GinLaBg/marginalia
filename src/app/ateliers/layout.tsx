import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ateliers d'écriture",
  description:
    "Gérez vos histoires en cours, rédigez vos chapitres et organisez vos personnages dans votre atelier d'écriture privé.",
  robots: {
    index: false, // pages privées — pas d'indexation
    follow: false,
  },
};

export default function AteliersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
