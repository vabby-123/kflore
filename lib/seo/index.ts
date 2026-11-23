import type { Metadata } from "next";

export const SITE_NAME = "KFLORÉ";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_TAGLINE = "Luxury floral arrangements and flowers";

function absolute(url?: string | null) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export function buildMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = `${SITE_URL}${params.path}`;
  const image = absolute(params.image);
  return {
    title: params.title,
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : undefined,
      type: params.type ?? "website",
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: image ? [image] : undefined,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-square.jpg`,
    description: SITE_TAGLINE,
  };
}

export function localBusinessJsonLd(contact: {
  businessName: string;
  address?: string | null;
  phone?: string | null;
  openingHours?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FloristShop",
    name: contact.businessName,
    address: contact.address || undefined,
    telephone: contact.phone || undefined,
    areaServed: ["Kuala Lumpur", "Klang Valley"],
    url: SITE_URL,
  };
}

export function productJsonLd(product: {
  name: string;
  description?: string | null;
  price: string;
  slug: string;
  image?: string;
  availability: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.image ? [absolute(product.image)] : undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "MYR",
      price: product.price,
      availability: `https://schema.org/${product.availability}`,
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description || undefined,
    image: article.image ? [absolute(article.image)] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt)?.toISOString(),
    mainEntityOfPage: `${SITE_URL}/journal/${article.slug}`,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}
