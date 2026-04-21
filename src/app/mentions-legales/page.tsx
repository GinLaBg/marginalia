import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — Marginalia",
  description: "Mentions légales de la plateforme Marginalia.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
        <h1 className="font-serif text-4xl">Mentions légales</h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : avril 2025</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">1. Éditeur du site</h2>
          <p>
            Le site <strong>Marginalia</strong> (accessible à l'adresse <strong>marginalia.app</strong>) est édité par :
          </p>
          <ul className="mt-3 space-y-1 list-none pl-0">
            <li><strong>Responsable de publication :</strong> Ning Cio</li>
            <li><strong>Statut :</strong> Particulier</li>
            <li><strong>Adresse email :</strong>{" "}
              <a href="mailto:Ning.cio@icloud.com" className="text-[var(--accent)] hover:underline">
                Ning.cio@icloud.com
              </a>
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground text-xs italic">
            En cas de passage en micro-entreprise, ces mentions seront mises à jour avec le numéro SIRET et l'adresse professionnelle correspondants.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">2. Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <ul className="mt-3 space-y-1 list-none pl-0">
            <li><strong>Société :</strong> Vercel Inc.</li>
            <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li><strong>Site web :</strong>{" "}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                vercel.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des éléments constituant le site Marginalia — structure, design, logo, code source, textes éditoriaux — est la propriété exclusive de Ning Cio, sauf mention contraire.
          </p>
          <p className="mt-3">
            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
          <p className="mt-3">
            Les contenus publiés par les utilisateurs (histoires, descriptions, couvertures) restent la propriété de leurs auteurs respectifs. En publiant sur Marginalia, les auteurs accordent à la plateforme une licence non exclusive, mondiale et gratuite pour héberger, afficher et diffuser leurs contenus dans le cadre du fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">4. Responsabilité</h2>
          <p>
            Marginalia s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, la plateforme ne peut garantir l'exhaustivité ou l'absence d'erreurs et décline toute responsabilité pour les dommages directs ou indirects liés à l'utilisation du site.
          </p>
          <p className="mt-3">
            Chaque utilisateur est seul responsable des contenus qu'il publie sur la plateforme. Marginalia se réserve le droit de supprimer tout contenu contraire aux présentes mentions légales, aux{" "}
            <Link href="/cgu" className="text-[var(--accent)] hover:underline">Conditions Générales d'Utilisation</Link>{" "}
            ou aux lois en vigueur, sans préavis ni justification.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">5. Données personnelles</h2>
          <p>
            Marginalia collecte et traite des données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD) et de la loi Informatique et Libertés.
          </p>
          <p className="mt-3">
            Pour en savoir plus, consultez notre{" "}
            <Link href="/confidentialite" className="text-[var(--accent)] hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">6. Cookies</h2>
          <p>
            Le site Marginalia peut utiliser des cookies techniques nécessaires à son fonctionnement (authentification, préférences d'affichage). Ces cookies ne sont pas utilisés à des fins publicitaires ou de traçage commercial.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">7. Droit applicable et juridiction</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français compétents seront seuls habilités à connaître du différend.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">8. Contact</h2>
          <p>
            Pour toute question ou réclamation, vous pouvez nous contacter à l'adresse suivante :{" "}
            <a href="mailto:Ning.cio@icloud.com" className="text-[var(--accent)] hover:underline">
              Ning.cio@icloud.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
        <Link href="/confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
        <Link href="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
      </div>
    </div>
  );
}
