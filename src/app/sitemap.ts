import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const BASE_URL = "https://marginalia.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/da`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/lire`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ateliers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/cgu`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Pages dynamiques : histoires publiées
  let storyRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient();
    const { data: stories } = await supabase
      .from("stories")
      .select("id, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (stories) {
      storyRoutes = stories.map((story) => ({
        url: `${BASE_URL}/lire/${story.id}`,
        lastModified: new Date(story.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Si Supabase est inaccessible au build, on continue sans les histoires
  }

  return [...staticRoutes, ...storyRoutes];
}
