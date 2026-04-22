import { BookOpen } from "lucide-react";
import { DABrowser } from "@/components/da/da-browser";

export const metadata = {
  title: "DA — Discussion & Analyse | Marginalia",
  description: "Recherchez des livres, lisez des critiques et participez aux débats de la communauté Marginalia.",
};

export default function DAPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-500" />
          <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">
            Discussion & Analyse
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl mb-3">
          Les livres de la communauté
        </h1>
        <p className="text-muted-foreground max-w-xl leading-relaxed text-sm">
          Cherchez un livre dans la selection Marginalia. Lisez et ecrivez des
          critiques, participez aux debats, contribuez aux analyses collectives.
        </p>
      </div>

      <DABrowser />
    </div>
  );
}
