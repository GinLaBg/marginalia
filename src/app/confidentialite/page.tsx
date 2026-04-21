import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Marginalia",
  description: "Comment Marginalia collecte, utilise et protège vos données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
        <h1 className="font-serif text-4xl">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dernière mise à jour : avril 2025 — conforme au RGPD (Règlement UE 2016/679)
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">1. Qui est responsable de vos données ?</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur la plateforme <strong>Marginalia</strong> est :
          </p>
          <ul className="mt-3 space-y-1 list-none pl-0">
            <li><strong>Responsable :</strong> Céleste Ciofani</li>
            <li><strong>Email :</strong>{" "}
              <a href="mailto:ciofani.celeste@icloud.com" className="text-[var(--accent)] hover:underline">
                ciofani.celeste@icloud.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">2. Données collectées</h2>
          <p>Marginalia collecte uniquement les données strictement nécessaires au fonctionnement du service :</p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <p className="font-medium mb-2">Lors de la création d'un compte</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Adresse email</li>
                <li>Pseudo (nom d'auteur choisi)</li>
                <li>Mot de passe (chiffré, jamais stocké en clair)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <p className="font-medium mb-2">Lors de la publication d'une histoire</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Titre, description, genre, statut</li>
                <li>Texte des chapitres</li>
                <li>Image de couverture (si fournie)</li>
                <li>Nom d'auteur public</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <p className="font-medium mb-2">Données techniques</p>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>Date et heure de création / modification des contenus</li>
                <li>Identifiant de session (cookie d'authentification)</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">
            Marginalia ne collecte <strong>pas</strong> de données de localisation, de numéro de téléphone, ni d'informations financières.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">3. Finalités du traitement</h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Permettre la publication, la lecture et la gestion de vos histoires</li>
            <li>Afficher votre profil d'auteur aux autres lecteurs</li>
            <li>Assurer la sécurité et le bon fonctionnement de la plateforme</li>
            <li>Répondre à vos demandes (support, signalements)</li>
          </ul>
          <p className="mt-3">
            Nous n'utilisons pas vos données à des fins publicitaires, de profilage commercial, ou de revente à des tiers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">4. Base légale des traitements</h2>
          <p>Les traitements reposent sur :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><strong>L'exécution du contrat</strong> : gestion de votre compte et de vos contenus</li>
            <li><strong>L'intérêt légitime</strong> : sécurité de la plateforme et lutte contre les abus</li>
            <li><strong>Votre consentement</strong> : pour tout traitement optionnel (ex : notifications)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">5. Durée de conservation</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>Données de compte :</strong> conservées pendant toute la durée de votre inscription, puis supprimées dans un délai de 30 jours après la clôture du compte.
            </li>
            <li>
              <strong>Contenus publiés :</strong> supprimés à votre demande ou lors de la suppression du compte.
            </li>
            <li>
              <strong>Données techniques (logs) :</strong> conservées 12 mois maximum.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">6. Partage des données</h2>
          <p>Marginalia ne vend pas et ne loue pas vos données personnelles.</p>
          <p className="mt-3">
            Vos données peuvent être transmises aux sous-traitants techniques suivants, dans le strict cadre de la fourniture du service :
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>
              <strong>Supabase</strong> (base de données et authentification) — hébergement dans l'Union Européenne
            </li>
            <li>
              <strong>Vercel Inc.</strong> (hébergement web) — États-Unis, couvert par les garanties contractuelles appropriées (DPA)
            </li>
          </ul>
          <p className="mt-3">
            Ces prestataires sont soumis à des obligations contractuelles de confidentialité et de sécurité conformes au RGPD.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">7. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible</li>
            <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
            <li><strong>Droit à la limitation</strong> : restreindre temporairement un traitement</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à :{" "}
            <a href="mailto:ciofani.celeste@icloud.com" className="text-[var(--accent)] hover:underline">
              ciofani.celeste@icloud.com
            </a>
          </p>
          <p className="mt-3">
            En cas de réclamation non résolue, vous pouvez saisir la{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              CNIL
            </a>{" "}
            (Commission Nationale de l'Informatique et des Libertés).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">8. Sécurité des données</h2>
          <p>
            Marginalia met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation accidentelle, notamment :
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Connexions sécurisées (HTTPS / TLS)</li>
            <li>Mots de passe chiffrés (hachage)</li>
            <li>Accès aux données limité au strict nécessaire</li>
            <li>Authentification sécurisée via Supabase Auth</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Aucun système n'étant infaillible, Marginalia ne peut garantir une sécurité absolue mais s'engage à notifier tout incident conformément aux obligations légales.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">9. Cookies</h2>
          <p>
            Marginalia utilise uniquement des cookies techniques indispensables au fonctionnement du service (session d'authentification, préférences d'affichage). Ces cookies n'ont pas de finalité publicitaire ou analytique.
          </p>
          <p className="mt-3">
            Aucun cookie tiers de traçage n'est déposé sur votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">10. Mineurs</h2>
          <p>
            Marginalia est accessible aux personnes âgées de 13 ans et plus. En dessous de 16 ans, l'inscription nécessite le consentement d'un représentant légal. Marginalia ne collecte pas sciemment de données relatives à des enfants de moins de 13 ans.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">11. Modifications</h2>
          <p>
            Cette politique peut être mise à jour à tout moment. La date de dernière mise à jour est indiquée en haut de ce document. En continuant à utiliser Marginalia après une modification, vous acceptez la nouvelle version.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">12. Contact</h2>
          <p>
            Pour toute question relative à vos données personnelles :{" "}
            <a href="mailto:ciofani.celeste@icloud.com" className="text-[var(--accent)] hover:underline">
              ciofani.celeste@icloud.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
        <Link href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
        <Link href="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
      </div>
    </div>
  );
}
