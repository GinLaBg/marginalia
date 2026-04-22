import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/ateliers/",        // pages privées (atelier d'écriture)
          "/profil/",          // profils privés
          "/auth/",            // pages de connexion/inscription
          "/api/",             // routes API
        ],
      },
    ],
    sitemap: "https://marginalia.app/sitemap.xml",
    host: "https://marginalia.app",
  };
}
