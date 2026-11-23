import { cache } from "react";
import { and, asc, count, desc, eq, gt, ilike, inArray, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  collections,
  products,
  productImages,
  productVariants,
  productCollections,
  homepage,
  aboutPage,
  deliverySettings,
  contactSettings,
  heroSlides,
  signaturePicks,
  journalArticles,
  homepageSections,
  siteSettings,
  orders,
  orderItems,
} from "./schema";
import { DEFAULT_HOMEPAGE_SECTIONS, type HomepageSectionKey } from "@/lib/homepage-sections";
import type { ProductCardDTO } from "@/types/catalogue";

/**
 * Data layer for the storefront.
 *
 * Rules of thumb used here:
 *  - select only the columns a view needs (no `select *` for product cards);
 *  - never query per product: images are fetched once with `inArray(productId, ids)`;
 *  - request-scoped `cache()` de-duplicates layout + page reads of the same singleton;
 *  - freshness across requests comes from ISR (`revalidate` on pages/layouts) plus
 *    `revalidateStorefront()` after admin edits.
 */

// ---------- Build-time safety net ----------
//
// Some hosts (e.g. Railway) don't expose private networking to the `next build` step, only to the
// deployed container at runtime. Since several storefront pages prerender at build time, a DB that's
// merely *unreachable during the build* would otherwise fail the whole build. `buildSafe` catches
// that specific situation (and only then — runtime errors still throw normally) and falls back to
// a sane default; the real content fills in on the first request after deploy via ISR revalidation.

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

async function buildSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isBuildPhase) return fn();
  try {
    return await fn();
  } catch (err) {
    console.warn("[build] Database unreachable during build — using a fallback for this page.", err instanceof Error ? err.message : err);
    return fallback;
  }
}

// ---------- CMS singletons (create-on-read defaults) ----------

async function readSingleton<T extends { id: unknown }>(
  read: () => Promise<T[]>,
  create: () => Promise<unknown>
): Promise<T> {
  const [row] = await read();
  if (row) return row;
  await create();
  const [created] = await read();
  return created;
}

const FALLBACK_HOMEPAGE: typeof homepage.$inferSelect = {
  id: "homepage",
  aboutHeading: "Flowers with feeling.",
  aboutExcerpt: null,
  aboutImage: null,
  instagramEnabled: false,
  instagramHandle: null,
  testimonialsEnabled: false,
  updatedAt: new Date(0),
};

const FALLBACK_ABOUT: typeof aboutPage.$inferSelect = {
  id: "about",
  familyFlorist: true,
  yearsOfExperience: null,
  founderName: null,
  story: null,
  mission: null,
  values: [],
  image: null,
  additionalImages: [],
  updatedAt: new Date(0),
};

const FALLBACK_DELIVERY: typeof deliverySettings.$inferSelect = {
  id: "delivery",
  areas: "Kuala Lumpur & Klang Valley",
  excludedAreas: null,
  sameDayAvailable: true,
  charges: null,
  orderCutOffTime: null,
  deliveryNotes: null,
  publicHolidayNotes: null,
  updatedAt: new Date(0),
};

const FALLBACK_CONTACT: typeof contactSettings.$inferSelect = {
  id: "contact",
  businessName: "KFLORÉ",
  whatsapp: null,
  phone: null,
  email: null,
  address: null,
  googleMapsUrl: null,
  openingHours: null,
  instagram: null,
  facebook: null,
  tiktok: null,
  logoUrl: null,
  currency: "MYR",
  timezone: "Asia/Kuala_Lumpur",
  updatedAt: new Date(0),
};

const FALLBACK_SITE: typeof siteSettings.$inferSelect = {
  id: "site",
  announcementEnabled: true,
  announcementMessage: "Same-Day Delivery • Kuala Lumpur & Klang Valley",
  announcementHref: null,
  announcementBg: "#5A1725",
  announcementFg: "#F5F0E8",
  footerStatement: "Thoughtfully arranged flowers for life's meaningful moments.",
  footerCtaLabel: "TALK TO US",
  newsletterHeading: "Stay in Bloom",
  newsletterText: "Receive new collection launches, seasonal flowers and special moments from KFLORÉ.",
  featuredHeading: "Elegance in Bloom",
  paymentTngQrImage: null,
  paymentDuitnowQrImage: null,
  paymentMaybankQrImage: null,
  paymentBankDetails: null,
  updatedAt: new Date(0),
};

export const getHomepageContent = cache(() =>
  buildSafe(
    () =>
      readSingleton(
        () => db.select().from(homepage).where(eq(homepage.id, "homepage")),
        () => db.insert(homepage).values({ id: "homepage" }).onConflictDoNothing()
      ),
    FALLBACK_HOMEPAGE
  )
);

export const getAboutContent = cache(() =>
  buildSafe(
    () =>
      readSingleton(
        () => db.select().from(aboutPage).where(eq(aboutPage.id, "about")),
        () => db.insert(aboutPage).values({ id: "about" }).onConflictDoNothing()
      ),
    FALLBACK_ABOUT
  )
);

export const getDeliveryContent = cache(() =>
  buildSafe(
    () =>
      readSingleton(
        () => db.select().from(deliverySettings).where(eq(deliverySettings.id, "delivery")),
        () => db.insert(deliverySettings).values({ id: "delivery" }).onConflictDoNothing()
      ),
    FALLBACK_DELIVERY
  )
);

export const getContactContent = cache(() =>
  buildSafe(
    () =>
      readSingleton(
        () => db.select().from(contactSettings).where(eq(contactSettings.id, "contact")),
        () => db.insert(contactSettings).values({ id: "contact" }).onConflictDoNothing()
      ),
    FALLBACK_CONTACT
  )
);

export const getSiteSettings = cache(() =>
  buildSafe(
    () =>
      readSingleton(
        () => db.select().from(siteSettings).where(eq(siteSettings.id, "site")),
        () => db.insert(siteSettings).values({ id: "site" }).onConflictDoNothing()
      ),
    FALLBACK_SITE
  )
);

export async function getHomepageSections(): Promise<Record<HomepageSectionKey, { enabled: boolean; sortOrder: number }>> {
  const rows = await db.select().from(homepageSections);
  const merged = Object.fromEntries(
    DEFAULT_HOMEPAGE_SECTIONS.map((s) => [s.key, { enabled: true, sortOrder: s.sortOrder }])
  ) as Record<HomepageSectionKey, { enabled: boolean; sortOrder: number }>;
  for (const r of rows) {
    if (r.key in merged) merged[r.key as HomepageSectionKey] = { enabled: r.enabled, sortOrder: r.sortOrder };
  }
  return merged;
}

// ---------- Categories / Collections ----------

export const getPublishedCategories = cache(() =>
  db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.status, "PUBLISHED"))
    .orderBy(asc(categories.sortOrder), asc(categories.name))
);

const collectionCardColumns = {
  id: collections.id,
  name: collections.name,
  slug: collections.slug,
  tagline: collections.tagline,
  description: collections.description,
  image: collections.image,
  heroImage: collections.heroImage,
  type: collections.type,
  featured: collections.featured,
  homepagePosition: collections.homepagePosition,
  sortOrder: collections.sortOrder,
};

export const getPublishedCollections = cache(() =>
  buildSafe(
    () =>
      db
        .select(collectionCardColumns)
        .from(collections)
        .where(eq(collections.status, "PUBLISHED"))
        .orderBy(asc(collections.sortOrder), asc(collections.name)),
    []
  )
);

export function getFeaturedCollections(limit = 6) {
  return db
    .select(collectionCardColumns)
    .from(collections)
    .where(and(eq(collections.status, "PUBLISHED"), eq(collections.featured, true)))
    .orderBy(sql`${collections.homepagePosition} asc nulls last`, asc(collections.sortOrder))
    .limit(limit);
}

export const getCollectionBySlug = cache(async (slug: string) => {
  const [row] = await db.select().from(collections).where(eq(collections.slug, slug));
  return row ?? null;
});

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug));
  return row ?? null;
}

// ---------- Products ----------

export interface ProductQuery {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  featured?: boolean;
  bestSeller?: boolean;
  inStockOnly?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  limit?: number;
  offset?: number;
}

function productConditions(opts: ProductQuery): SQL[] {
  const conditions: SQL[] = [eq(products.status, "PUBLISHED")];
  if (opts.categorySlug) conditions.push(eq(categories.slug, opts.categorySlug));
  if (opts.featured) conditions.push(eq(products.featured, true));
  if (opts.bestSeller) conditions.push(eq(products.bestSeller, true));
  if (opts.inStockOnly) conditions.push(ne(products.stockStatus, "OUT_OF_STOCK"));
  if (opts.collectionSlug) {
    conditions.push(
      inArray(
        products.id,
        db
          .select({ id: productCollections.productId })
          .from(productCollections)
          .innerJoin(collections, eq(collections.id, productCollections.collectionId))
          .where(eq(collections.slug, opts.collectionSlug))
      )
    );
  }
  if (opts.search) {
    const term = `%${opts.search.replace(/[%_]/g, "\\$&")}%`;
    conditions.push(
      or(ilike(products.name, term), ilike(products.description, term), ilike(products.occasion, term))!
    );
  }
  return conditions;
}

const cardColumns = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  shortDescription: products.shortDescription,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  stockStatus: products.stockStatus,
  featured: products.featured,
  bestSeller: products.bestSeller,
  categoryId: categories.id,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

type CardRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  stockStatus: string;
  featured: boolean;
  bestSeller: boolean;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

/** One query for every card's images (first two are enough for primary + hover). */
async function attachCardImages(rows: CardRow[]): Promise<ProductCardDTO[]> {
  if (rows.length === 0) return [];
  const [imgs, variantPrices] = await Promise.all([
    db
      .select({ id: productImages.id, productId: productImages.productId, url: productImages.url, altText: productImages.altText, sortOrder: productImages.sortOrder })
      .from(productImages)
      .where(inArray(productImages.productId, rows.map((r) => r.id)))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select({ productId: productVariants.productId, name: productVariants.name, price: productVariants.price })
      .from(productVariants)
      .where(inArray(productVariants.productId, rows.map((r) => r.id))),
  ]);

  const byProduct = new Map<string, typeof imgs>();
  for (const img of imgs) {
    const list = byProduct.get(img.productId) ?? [];
    if (list.length < 2) list.push(img);
    byProduct.set(img.productId, list);
  }

  const sizesByProduct = new Map<string, string[]>();
  const pricesByProduct = new Map<string, string[]>();
  for (const v of variantPrices) {
    sizesByProduct.set(v.productId, [...(sizesByProduct.get(v.productId) ?? []), v.name]);
    if (!v.price) continue;
    const list = pricesByProduct.get(v.productId) ?? [];
    list.push(v.price);
    pricesByProduct.set(v.productId, list);
  }

  return rows.map((r) => {
    const variantPriceList = pricesByProduct.get(r.id) ?? [];
    const allPrices = [parseFloat(r.price), ...variantPriceList.map(parseFloat)];
    const min = Math.min(...allPrices);
    // Only worth a "From" label when the product's prices actually span a range.
    const priceFrom = variantPriceList.length > 0 && min < Math.max(...allPrices) ? min.toFixed(2) : null;

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      shortDescription: r.shortDescription,
      price: r.price,
      priceFrom,
      sizes: sortSizes(sizesByProduct.get(r.id) ?? []),
      compareAtPrice: r.compareAtPrice,
      stockStatus: r.stockStatus,
      featured: r.featured,
      bestSeller: r.bestSeller,
      images: byProduct.get(r.id) ?? [],
      category: r.categoryId && r.categoryName && r.categorySlug ? { id: r.categoryId, name: r.categoryName, slug: r.categorySlug } : null,
    };
  });
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
function sortSizes(names: string[]): string[] {
  const rank = (n: string) => { const i = SIZE_ORDER.indexOf(n.toUpperCase()); return i === -1 ? 99 : i; };
  return [...names].sort((a, b) => rank(a) - rank(b));
}

export async function getPublishedProducts(opts: ProductQuery = {}): Promise<ProductCardDTO[]> {
  const orderBy =
    opts.sort === "price-asc"
      ? [asc(products.price)]
      : opts.sort === "price-desc"
        ? [desc(products.price)]
        : opts.sort === "name"
          ? [asc(products.name)]
          : [desc(products.createdAt)];

  const rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...productConditions(opts)))
    .orderBy(...orderBy)
    .limit(opts.limit ?? 48)
    .offset(opts.offset ?? 0);

  return attachCardImages(rows);
}

export async function countPublishedProducts(opts: ProductQuery = {}): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...productConditions(opts)));
  return row?.n ?? 0;
}

/** Lean list for the sitemap: slugs only. */
export function getPublishedProductSlugs() {
  return db.select({ slug: products.slug }).from(products).where(eq(products.status, "PUBLISHED"));
}

export const getProductBySlug = cache(async (slug: string) => {
  const [row] = await db.select().from(products).where(eq(products.slug, slug));
  if (!row) return null;
  const [category, images, variants, collectionLinks] = await Promise.all([
    row.categoryId
      ? db.select().from(categories).where(eq(categories.id, row.categoryId)).then((r) => r[0] ?? null)
      : Promise.resolve(null),
    db.select().from(productImages).where(eq(productImages.productId, row.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, row.id)),
    db.select().from(productCollections).where(eq(productCollections.productId, row.id)),
  ]);
  return { ...row, category, images, variants, collectionIds: collectionLinks.map((c) => c.collectionId) };
});

// ---------- Homepage ----------

export async function getActiveHeroSlides() {
  return db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt)).limit(5);
}

/** The enabled pick whose scheduling window contains "now" (latest start wins). */
export async function getActiveSignaturePick() {
  const now = new Date();
  const [pick] = await db
    .select()
    .from(signaturePicks)
    .where(
      and(
        eq(signaturePicks.enabled, true),
        or(isNull(signaturePicks.startDate), lte(signaturePicks.startDate, now)),
        or(isNull(signaturePicks.endDate), gt(signaturePicks.endDate, now))
      )
    )
    .orderBy(sql`${signaturePicks.startDate} desc nulls last`, desc(signaturePicks.createdAt))
    .limit(1);
  if (!pick) return null;

  if (!pick.productId) return { pick, product: null, images: [] as { url: string; altText: string | null }[] };

  const [[product], images] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        shortDescription: products.shortDescription,
        occasion: products.occasion,
        colour: products.colour,
        flowerType: products.flowerType,
        status: products.status,
      })
      .from(products)
      .where(eq(products.id, pick.productId)),
    db
      .select({ url: productImages.url, altText: productImages.altText })
      .from(productImages)
      .where(eq(productImages.productId, pick.productId))
      .orderBy(asc(productImages.sortOrder))
      .limit(3),
  ]);
  if (!product || product.status !== "PUBLISHED") return { pick, product: null, images: [] as { url: string; altText: string | null }[] };
  return { pick, product, images };
}

export async function getLatestJournalArticles(limit = 3) {
  return buildSafe(
    () =>
      db
        .select({
          id: journalArticles.id,
          title: journalArticles.title,
          slug: journalArticles.slug,
          category: journalArticles.category,
          excerpt: journalArticles.excerpt,
          image: journalArticles.image,
          publishedAt: journalArticles.publishedAt,
        })
        .from(journalArticles)
        .where(and(eq(journalArticles.status, "PUBLISHED"), or(isNull(journalArticles.publishedAt), lte(journalArticles.publishedAt, new Date()))))
        .orderBy(desc(journalArticles.publishedAt), desc(journalArticles.createdAt))
        .limit(limit),
    []
  );
}

// ---------- Orders (paid checkout) ----------

/** Public, minimal order summary for the post-payment confirmation page. */
export async function getOrderForConfirmation(id: string) {
  const [order] = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      subtotal: orders.subtotal,
      paymentStatus: orders.paymentStatus,
      paymentProvider: orders.paymentProvider,
      deliveryAddress: orders.deliveryAddress,
      deliveryDate: orders.deliveryDate,
      deliveryTimeSlot: orders.deliveryTimeSlot,
      cardMessage: orders.cardMessage,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.id, id));
  if (!order) return null;

  const items = await db
    .select({ name: orderItems.name, variant: orderItems.variant, quantity: orderItems.quantity, price: orderItems.price })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return { ...order, items };
}

export async function getJournalArticleBySlug(slug: string) {
  const [row] = await db.select().from(journalArticles).where(eq(journalArticles.slug, slug));
  return row && row.status === "PUBLISHED" ? row : null;
}

/**
 * Everything the homepage needs, fetched in parallel from the server in one place.
 * Two product lists share a single image query.
 */
export async function getHomepageData() {
  const [home, siteContent, sections, slides, delivery, contact, signature, featuredCollections, journal, bestRows, newRows] =
    await Promise.all([
      getHomepageContent(),
      getSiteSettings(),
      buildSafe(
        () => getHomepageSections(),
        Object.fromEntries(DEFAULT_HOMEPAGE_SECTIONS.map((s) => [s.key, { enabled: true, sortOrder: s.sortOrder }])) as Record<
          HomepageSectionKey,
          { enabled: boolean; sortOrder: number }
        >
      ),
      buildSafe(() => getActiveHeroSlides(), []),
      getDeliveryContent(),
      getContactContent(),
      buildSafe(() => getActiveSignaturePick(), null),
      buildSafe(() => getFeaturedCollections(6), []),
      getLatestJournalArticles(3),
      buildSafe(
        () =>
          db
            .select(cardColumns)
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .where(and(eq(products.status, "PUBLISHED"), eq(products.bestSeller, true)))
            .orderBy(desc(products.createdAt))
            .limit(8),
        []
      ),
      buildSafe(
        () =>
          db
            .select(cardColumns)
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .where(eq(products.status, "PUBLISHED"))
            .orderBy(desc(products.createdAt))
            .limit(8),
        []
      ),
    ]);

  const all = await attachCardImages([...bestRows, ...newRows.filter((n) => !bestRows.some((b) => b.id === n.id))]);
  const byId = new Map(all.map((p) => [p.id, p]));

  return {
    home,
    site: siteContent,
    sections,
    slides,
    delivery,
    contact,
    signature,
    featuredCollections,
    journal,
    bestSellers: bestRows.map((r) => byId.get(r.id)!),
    newIn: newRows.map((r) => byId.get(r.id)!),
  };
}
