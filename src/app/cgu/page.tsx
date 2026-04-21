import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Marginalia",
  description: "Règles d'utilisation de la plateforme de publication d'histoires Marginalia.",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
        <h1 className="font-serif text-4xl">Conditions Générales d'Utilisation</h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : avril 2025</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">1. Objet et acceptation</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme <strong>Marginalia</strong>, accessible à l'adresse <strong>marginalia.app</strong>, éditée par Ning Cio.
          </p>
          <p className="mt-3">
            En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve l'intégralité des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez vous abstenir d'utiliser Marginalia.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">2. Description du service</h2>
          <p>
            Marginalia est une plateforme communautaire francophone dédiée à la publication et à la lecture d'histoires. Elle permet notamment à ses utilisateurs de :
          </p>
          <ul className="mt-3 space-y-1 list-disc list-inside">
            <li>Créer un compte auteur et un profil public</li>
            <li>Publier des histoires (titres, descriptions, chapitres, couvertures)</li>
            <li>Modifier et supprimer leurs propres histoires</li>
            <li>Lire les histoires publiées par d'autres auteurs</li>
            <li>Consulter les profils des auteurs</li>
          </ul>
          <p className="mt-3">
            Marginalia est une plateforme de contenu généré par les utilisateurs (UGC). Elle n'est pas un éditeur des œuvres publiées et ne procède pas à la relecture ou à la validation éditoriale des contenus.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">3. Inscription et compte utilisateur</h2>

          <h3 className="font-medium mt-4 mb-2">3.1 Création du compte</h3>
          <p>
            L'inscription est ouverte à toute personne âgée d'au moins 13 ans. En dessous de 16 ans, le consentement d'un représentant légal est requis. En créant un compte, vous vous engagez à fournir des informations exactes et à les maintenir à jour.
          </p>

          <h3 className="font-medium mt-4 mb-2">3.2 Responsabilité du compte</h3>
          <p>
            Vous êtes seul responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte vous est imputable. En cas de compromission, vous devez en informer Marginalia sans délai à l'adresse{" "}
            <a href="mailto:Ning.cio@icloud.com" className="text-[var(--accent)] hover:underline">
              Ning.cio@icloud.com
            </a>.
          </p>

          <h3 className="font-medium mt-4 mb-2">3.3 Suppression du compte</h3>
          <p>
            Vous pouvez demander la suppression de votre compte à tout moment en contactant Marginalia par email. Cette suppression entraîne l'effacement de vos données personnelles et la dépublication de vos histoires dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">4. Contenus publiés par les utilisateurs</h2>

          <h3 className="font-medium mt-4 mb-2">4.1 Propriété intellectuelle des auteurs</h3>
          <p>
            Chaque auteur conserve l'intégralité des droits de propriété intellectuelle sur les histoires et contenus qu'il publie sur Marginalia. La publication sur la plateforme ne transfère aucun droit de propriété à Marginalia.
          </p>
          <p className="mt-3">
            En publiant un contenu sur Marginalia, vous accordez à la plateforme une <strong>licence non exclusive, mondiale, gratuite et transférable</strong> pour héberger, afficher, reproduire et diffuser vos œuvres dans le cadre du fonctionnement du service, et uniquement dans ce cadre.
          </p>
          <p className="mt-3">
            Cette licence prend fin lors de la suppression définitive du contenu ou du compte.
          </p>

          <h3 className="font-medium mt-4 mb-2">4.2 Garanties de l'auteur</h3>
          <p>En publiant un contenu, vous déclarez et garantissez que :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Vous êtes l'auteur original de l'œuvre ou disposez des droits nécessaires à sa publication</li>
            <li>La publication de ce contenu ne porte pas atteinte aux droits d'un tiers</li>
            <li>Le contenu est conforme aux présentes CGU et aux lois françaises applicables</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">5. Contenus interdits</h2>
          <p>Il est strictement interdit de publier sur Marginalia tout contenu :</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>
              <strong>Illégal</strong> : contenu contraire aux lois françaises ou européennes en vigueur
            </li>
            <li>
              <strong>Plagiat</strong> : œuvre copiée ou reproduite sans autorisation de l'auteur original
            </li>
            <li>
              <strong>Haineux ou discriminatoire</strong> : incitation à la haine, à la violence, ou à la discrimination fondée sur l'origine, le sexe, l'orientation sexuelle, la religion, le handicap, ou toute autre caractéristique protégée
            </li>
            <li>
              <strong>Violent ou choquant de manière gratuite</strong> : représentations de violence extrême sans valeur narrative ou artistique
            </li>
            <li>
              <strong>Pornographique impliquant des mineurs</strong> : tout contenu à caractère sexuel impliquant des personnages mineurs, quelles que soient les circonstances
            </li>
            <li>
              <strong>Portant atteinte à la vie privée</strong> : publication d'informations personnelles d'un tiers sans son consentement
            </li>
            <li>
              <strong>Trompeur ou frauduleux</strong> : usurpation d'identité, diffusion de fausses informations dans une intention malveillante
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Marginalia se réserve le droit d'apprécier souverainement le caractère contraire aux présentes CGU d'un contenu et d'agir en conséquence.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">6. Modération et sanctions</h2>

          <h3 className="font-medium mt-4 mb-2">6.1 Suppression de contenu</h3>
          <p>
            Marginalia se réserve le droit de supprimer, sans préavis ni justification, tout contenu qui lui semble contraire aux présentes CGU, à la loi, ou susceptible de nuire à la communauté ou à la réputation de la plateforme.
          </p>

          <h3 className="font-medium mt-4 mb-2">6.2 Suspension et clôture de compte</h3>
          <p>
            En cas de violation grave ou répétée des CGU, Marginalia peut suspendre temporairement ou clôturer définitivement le compte concerné, sans obligation d'indemnisation.
          </p>

          <h3 className="font-medium mt-4 mb-2">6.3 Signalement</h3>
          <p>
            Tout utilisateur peut signaler un contenu qui lui semble inapproprié en contactant Marginalia à l'adresse{" "}
            <a href="mailto:Ning.cio@icloud.com" className="text-[var(--accent)] hover:underline">
              Ning.cio@icloud.com
            </a>{" "}
            en précisant l'URL du contenu concerné et la raison du signalement. Marginalia s'engage à traiter les signalements dans les meilleurs délais.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">7. Responsabilité de Marginalia</h2>
          <p>
            Marginalia agit en qualité d'hébergeur de contenus au sens de l'article 6 de la loi pour la Confiance dans l'Économie Numérique (LCEN). À ce titre, sa responsabilité ne peut être engagée du fait des contenus publiés par les utilisateurs, à condition qu'elle agisse promptement pour retirer les contenus signalés comme manifestement illicites.
          </p>
          <p className="mt-3">
            Marginalia ne garantit pas la disponibilité permanente du service et décline toute responsabilité en cas d'interruption, de perte de données ou d'inaccessibilité temporaire du site.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">8. Données personnelles</h2>
          <p>
            Le traitement de vos données personnelles est décrit dans notre{" "}
            <Link href="/confidentialite" className="text-[var(--accent)] hover:underline">
              Politique de confidentialité
            </Link>
            , qui fait partie intégrante des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">9. Gratuité et évolution du service</h2>
          <p>
            L'accès à Marginalia est actuellement gratuit. Marginalia se réserve le droit d'introduire des fonctionnalités payantes dans le futur. Le cas échéant, les utilisateurs en seront informés au préalable, et les fonctionnalités actuellement gratuites resteront accessibles dans leur périmètre existant.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">10. Modifications des CGU</h2>
          <p>
            Marginalia se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, les utilisateurs en seront informés par email ou par une notification sur la plateforme. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">11. Droit applicable et litiges</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou leur exécution sera soumis, à défaut de résolution amiable, aux tribunaux compétents de France.
          </p>
          <p className="mt-3">
            Conformément à l'article L.612-1 du Code de la consommation, tout consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold mb-3">12. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU ou pour signaler un contenu :{" "}
            <a href="mailto:Ning.cio@icloud.com" className="text-[var(--accent)] hover:underline">
              Ning.cio@icloud.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-14 flex flex-wrap gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
        <Link href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
        <Link href="/confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
      </div>
    </div>
  );
}
