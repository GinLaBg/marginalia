import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-0">
              <span className="font-serif italic text-lg text-foreground">Margin</span>
              <span className="font-sans text-lg font-light text-muted-foreground">alia</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Lire · Écrire · Partager
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Explorer</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/da" className="hover:text-foreground transition-colors">DA</Link></li>
              <li><Link href="/ateliers" className="hover:text-foreground transition-colors">Ateliers</Link></li>
              <li><Link href="/agora" className="hover:text-foreground transition-colors">Agora</Link></li>
              <li><Link href="/lives" className="hover:text-foreground transition-colors">Lives</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Compte</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/inscription" className="hover:text-foreground transition-colors">S&apos;inscrire</Link></li>
              <li><Link href="/connexion" className="hover:text-foreground transition-colors">Connexion</Link></li>
              <li><Link href="/profil" className="hover:text-foreground transition-colors">Mon profil</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Légal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/cgu" className="hover:text-foreground transition-colors">CGU</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Marginalia. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
