import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getPublishedProductSlugs, getPublishedCollections, getPublishedCategories } from "@/lib/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/delivery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];

  try {
    const [products, collections, categories] = await Promise.all([
      getPublishedProductSlugs(),
      getPublishedCollections(),
      getPublishedCategories(),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/shop?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}

