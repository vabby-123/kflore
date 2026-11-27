import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import {
  users,
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
  siteSettings,
  homepageSections,
} from "../lib/db/schema";
import { DEFAULT_HOMEPAGE_SECTIONS } from "../lib/homepage-sections";

const PLACEHOLDER = (slug: string) => `/images/placeholders/${slug}.svg`;

async function main() {
  console.log("Seeding KFLORÉ demo data…");

  // ---------- Admin user ----------
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@kflore.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-before-seeding";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db
    .insert(users)
    .values({ name: "KFLORÉ Admin", email: adminEmail, passwordHash, role: "ADMIN" })
    .onConflictDoNothing();
  console.log(`  ✓ Admin user ready: ${adminEmail}`);

  // ---------- Categories (also mirrored as Collections per spec) ----------
  const CATEGORY_DEFS = [
    { name: "Hand Bouquets", slug: "hand-bouquets", desc: "Freshly hand-tied bouquets for everyday and special moments.", img: "cat-hand-bouquets" },
    { name: "Flower Boxes", slug: "flower-boxes", desc: "Elegant boxed arrangements that make a lasting impression.", img: "cat-flower-boxes" },
    { name: "Graduation Bouquets", slug: "graduation-bouquets", desc: "Celebrate every milestone with a bouquet made for the occasion.", img: "cat-graduation-bouquets" },
    { name: "Birthday Flowers", slug: "birthday-flowers", desc: "Bright, joyful arrangements to mark another year.", img: "cat-birthday-flowers" },
    { name: "Anniversary Flowers", slug: "anniversary-flowers", desc: "Celebrate your story with flowers designed for unforgettable moments.", img: "cat-anniversary-flowers" },
    { name: "Sympathy Flowers", slug: "sympathy-flowers", desc: "Gentle, thoughtful arrangements to express condolences.", img: "cat-sympathy-flowers" },
    { name: "Wedding Flowers", slug: "wedding-flowers", desc: "Timeless florals for your most important day.", img: "cat-wedding-flowers" },
    { name: "Grand Opening Stands", slug: "grand-opening-stands", desc: "Statement floral stands to mark a grand opening in style.", img: "cat-grand-opening-stands" },
  ];

  // Grouping + editorial copy for the seeded collections. Six are featured on the homepage mosaic.
  const COLLECTION_META: Record<string, { type: string; tagline: string; homepagePosition?: number }> = {
    "hand-bouquets": { type: "TYPE", tagline: "Hand-tied, made to be held." },
    "flower-boxes": { type: "TYPE", tagline: "Blooms, boxed with care." },
    "graduation-bouquets": { type: "OCCASION", tagline: "Mark the moment.", homepagePosition: 5 },
    "birthday-flowers": { type: "OCCASION", tagline: "Make their day bloom.", homepagePosition: 2 },
    "anniversary-flowers": { type: "OCCASION", tagline: "Celebrate your story.", homepagePosition: 1 },
    "sympathy-flowers": { type: "OCCASION", tagline: "Flowers of comfort and tribute.", homepagePosition: 4 },
    "wedding-flowers": { type: "OCCASION", tagline: "For moments worth remembering.", homepagePosition: 3 },
    "grand-opening-stands": { type: "OCCASION", tagline: "Make an entrance.", homepagePosition: 6 },
  };

  const categoryIds: Record<string, string> = {};
  const collectionIds: Record<string, string> = {};

  for (const [i, c] of CATEGORY_DEFS.entries()) {
    const [cat] = await db
      .insert(categories)
      .values({ name: c.name, slug: c.slug, description: c.desc, image: PLACEHOLDER(c.img), sortOrder: i })
      .onConflictDoUpdate({ target: categories.slug, set: { name: c.name, description: c.desc, image: PLACEHOLDER(c.img) } })
      .returning();
    categoryIds[c.slug] = cat.id;

    const meta = COLLECTION_META[c.slug];
    const fields = {
      name: c.name,
      description: c.desc,
      image: PLACEHOLDER(c.img),
      tagline: meta.tagline,
      type: meta.type,
      featured: meta.homepagePosition !== undefined,
      homepagePosition: meta.homepagePosition ?? null,
    };
    const [col] = await db
      .insert(collections)
      .values({ slug: c.slug, sortOrder: i, ...fields })
      .onConflictDoUpdate({ target: collections.slug, set: fields })
      .returning();
    collectionIds[c.slug] = col.id;
  }
  console.log(`  ✓ ${CATEGORY_DEFS.length} categories + collections`);

  // ---------- Demo products ----------
  const PRODUCT_DEFS = [
    {
      name: "Burgundy Romance",
      slug: "burgundy-romance",
      short: "A rich, romantic hand bouquet in deep burgundy tones.",
      description: "A rich, romantic hand-tied bouquet featuring deep burgundy roses and garden foliage. [Demo product — replace with real KFLORÉ arrangements from the admin panel.]",
      price: "228.00",
      compareAt: null,
      category: "hand-bouquets",
      tags: ["romantic", "roses", "burgundy"],
      featured: true,
      bestSeller: true,
      occasion: "Anniversary",
      flowerType: "Roses",
      colour: "Burgundy",
      images: ["product-burgundy-romance-1", "product-burgundy-romance-2"],
      variants: [{ name: "Standard", price: "228.00" }, { name: "Large", price: "288.00" }],
    },
    {
      name: "Blush Garden",
      slug: "blush-garden",
      short: "Soft blush and ivory blooms in a garden-style hand bouquet.",
      description: "A soft, romantic garden-style bouquet in blush and ivory tones. [Demo product — replace from the admin panel.]",
      price: "198.00",
      compareAt: "220.00",
      category: "hand-bouquets",
      tags: ["blush", "garden", "romantic"],
      featured: true,
      bestSeller: false,
      occasion: "Birthday",
      flowerType: "Mixed Garden Roses",
      colour: "Blush",
      images: ["product-blush-garden-1", "product-blush-garden-2"],
      variants: [{ name: "Standard", price: "198.00" }],
    },
    {
      name: "Timeless Ivory",
      slug: "timeless-ivory",
      short: "An elegant all-white flower box for refined occasions.",
      description: "An elegant all-white flower box featuring roses and lisianthus. [Demo product — replace from the admin panel.]",
      price: "268.00",
      compareAt: null,
      category: "flower-boxes",
      tags: ["ivory", "elegant", "box"],
      featured: true,
      bestSeller: true,
      occasion: "Congratulations",
      flowerType: "Roses & Lisianthus",
      colour: "Ivory",
      images: ["product-timeless-ivory-1", "product-timeless-ivory-2"],
      variants: [{ name: "Round Box", price: "268.00" }, { name: "Heart Box", price: "298.00" }],
    },
    {
      name: "Rose Luxe Box",
      slug: "rose-luxe-box",
      short: "A luxe box of premium roses, KFLORÉ's signature gift.",
      description: "A luxurious box of premium roses — a signature KFLORÉ gift. [Demo product — replace from the admin panel.]",
      price: "318.00",
      compareAt: "350.00",
      category: "flower-boxes",
      tags: ["luxe", "roses", "signature"],
      featured: false,
      bestSeller: true,
      occasion: "Anniversary",
      flowerType: "Roses",
      colour: "Red",
      images: ["product-rose-luxe-box-1", "product-rose-luxe-box-2"],
      variants: [{ name: "12 Roses", price: "318.00" }, { name: "24 Roses", price: "498.00" }],
    },
    {
      name: "Graduation Bloom",
      slug: "graduation-bloom",
      short: "A celebratory hand bouquet designed for graduation day.",
      description: "A bright, celebratory bouquet designed to mark graduation milestones. [Demo product — replace from the admin panel.]",
      price: "168.00",
      compareAt: null,
      category: "graduation-bouquets",
      tags: ["graduation", "celebration"],
      featured: false,
      bestSeller: false,
      occasion: "Graduation",
      flowerType: "Sunflowers & Roses",
      colour: "Gold & Ivory",
      images: ["product-graduation-bloom-1", "product-graduation-bloom-2"],
      variants: [{ name: "Standard", price: "168.00" }],
    },
    {
      name: "Anniversary Collection",
      slug: "anniversary-collection",
      short: "A curated arrangement to celebrate your story together.",
      description: "A curated arrangement celebrating your story with flowers designed for unforgettable moments. [Demo product — replace from the admin panel.]",
      price: "248.00",
      compareAt: null,
      category: "anniversary-flowers",
      tags: ["anniversary", "romantic"],
      featured: true,
      bestSeller: false,
      occasion: "Anniversary",
      flowerType: "Roses & Peonies",
      colour: "Rose Pink",
      images: ["product-anniversary-collection-1", "product-anniversary-collection-2"],
      variants: [{ name: "Standard", price: "248.00" }],
    },
    {
      name: "Sympathy White Lily",
      slug: "sympathy-white-lily",
      short: "A gentle white lily arrangement to express condolences.",
      description: "A gentle, respectful arrangement of white lilies to express condolences. [Demo product — replace from the admin panel.]",
      price: "228.00",
      compareAt: null,
      category: "sympathy-flowers",
      tags: ["sympathy", "white"],
      featured: false,
      bestSeller: false,
      occasion: "Sympathy",
      flowerType: "Lilies",
      colour: "White",
      images: ["product-sympathy-white-lily-1"],
      variants: [],
    },
    {
      name: "Wedding Cascade",
      slug: "wedding-cascade",
      short: "A cascading bridal bouquet for timeless wedding elegance.",
      description: "A cascading bridal bouquet crafted for timeless wedding elegance. [Demo product — replace from the admin panel; pricing shown is for inspiration only.]",
      price: "488.00",
      compareAt: null,
      category: "wedding-flowers",
      tags: ["wedding", "bridal"],
      featured: false,
      bestSeller: false,
      occasion: "Wedding",
      flowerType: "Roses, Peonies & Trailing Greenery",
      colour: "Ivory & Sage",
      images: ["product-wedding-cascade-1"],
      variants: [],
    },
    {
      name: "Grand Opening Stand",
      slug: "grand-opening-stand",
      short: "A statement floral stand to celebrate a grand opening.",
      description: "A statement floral stand to celebrate a grand opening in style. [Demo product — replace from the admin panel; pricing shown is for inspiration only.]",
      price: "588.00",
      compareAt: null,
      category: "grand-opening-stands",
      tags: ["grand-opening", "stand"],
      featured: false,
      bestSeller: false,
      occasion: "Grand Opening",
      flowerType: "Mixed Seasonal",
      colour: "Gold & Red",
      images: ["product-grand-opening-stand-1"],
      variants: [],
      deliveryEligible: false,
    },
  ] as const;

  for (const p of PRODUCT_DEFS) {
    const [product] = await db
      .insert(products)
      .values({
        name: p.name,
        slug: p.slug,
        shortDescription: p.short,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAt,
        categoryId: categoryIds[p.category],
        tags: [...p.tags],
        featured: p.featured,
        bestSeller: p.bestSeller,
        status: "PUBLISHED",
        stockStatus: "IN_STOCK",
        occasion: p.occasion,
        flowerType: p.flowerType,
        colour: p.colour,
        deliveryEligible: "deliveryEligible" in p ? p.deliveryEligible : true,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: { price: p.price, description: p.description },
      })
      .returning();

    await db.delete(productImages).where(eqProduct(product.id));
    for (const [i, img] of p.images.entries()) {
      await db.insert(productImages).values({
        productId: product.id,
        url: PLACEHOLDER(img),
        altText: p.name,
        sortOrder: i,
      });
    }

    await db.delete(productVariants).where(eqProductVariant(product.id));
    // Every product is offered in four sizes; price steps up per size (edit in /admin → Products).
    const base = parseFloat(p.price);
    for (const [i, size] of ["Regular", "M", "L", "XL"].entries()) {
      await db.insert(productVariants).values({ productId: product.id, name: size, price: (base + i * 40).toFixed(2), stock: 10 });
    }

    const collectionId = collectionIds[p.category];
    if (collectionId) {
      await db.insert(productCollections).values({ productId: product.id, collectionId }).onConflictDoNothing();
    }
  }
  console.log(`  ✓ ${PRODUCT_DEFS.length} demo products (clearly marked as demo content in their descriptions)`);

  // ---------- CMS singletons ----------
  await db
    .insert(homepage)
    .values({ id: "homepage", aboutHeading: "Flowers with feeling.", aboutImage: PLACEHOLDER("about-story"), aboutExcerpt: "KFLORÉ is a family florist bringing thoughtful, handcrafted arrangements to every occasion." })
    .onConflictDoNothing();

  await db
    .insert(aboutPage)
    .values({
      id: "about",
      familyFlorist: true,
      founderName: "Keshwini Ganesan",
      story: "KFLORÉ began as a family florist with a simple belief: that flowers, thoughtfully arranged, can turn any moment into something memorable. [Placeholder — please provide the full brand story, and years of experience if you'd like it displayed.]",
      mission: "To craft timeless floral expressions for every story, delivered with care.",
      values: ["Craftsmanship", "Freshness", "Thoughtful Service"],
      image: PLACEHOLDER("about-story"),
    })
    .onConflictDoUpdate({ target: aboutPage.id, set: { founderName: "Keshwini Ganesan" } });

  await db
    .insert(deliverySettings)
    .values({
      id: "delivery",
      areas: "Kuala Lumpur & Klang Valley",
      sameDayAvailable: true,
      charges: null,
      orderCutOffTime: null,
      deliveryNotes: "Delivery charges and order cut-off times are configured in the admin panel — please add the real figures before launch.",
    })
    .onConflictDoNothing();

  await db
    .insert(contactSettings)
    .values({
      id: "contact",
      businessName: "KFLORÉ",
      whatsapp: process.env.WHATSAPP_NUMBER || "601160515983",
      phone: null,
      email: process.env.BUSINESS_EMAIL || null,
      address: null,
      googleMapsUrl: null,
      openingHours: "Mon–Sat: 9:00 AM – 7:00 PM\nSun: By appointment",
      currency: "MYR",
      timezone: "Asia/Kuala_Lumpur",
    })
    .onConflictDoUpdate({ target: contactSettings.id, set: { businessName: "KFLORÉ" } });

  // ---------- Extra collections (style / flower / more types & occasions) ----------
  // Matched to demo products by their flower type / colour / occasion. A collection that matches no
  // product is created as DRAFT so the storefront never links to an empty page; publish it in the admin
  // once products are assigned.
  const EXTRA_COLLECTIONS: {
    name: string;
    slug: string;
    type: string;
    tagline: string;
    match: (p: { flowerType: string; colour: string; occasion: string; tags: readonly string[] }) => boolean;
  }[] = [
    { name: "Romantic", slug: "romantic", type: "STYLE", tagline: "Soft, lush and full of feeling.", match: (p) => p.tags.includes("romantic") },
    { name: "Demure & Elegant", slug: "demure-elegant", type: "STYLE", tagline: "Quiet, refined and timeless.", match: (p) => p.tags.includes("elegant") || p.tags.includes("ivory") },
    { name: "Bold & Vibrant", slug: "bold-vibrant", type: "STYLE", tagline: "Colour that makes a statement.", match: (p) => p.colour.includes("Gold") },
    { name: "Light & Playful", slug: "light-playful", type: "STYLE", tagline: "Bright, joyful and easy.", match: () => false },
    { name: "Sultry & Moody", slug: "sultry-moody", type: "STYLE", tagline: "Deep tones, dramatic mood.", match: (p) => p.colour === "Burgundy" },
    { name: "Roses", slug: "roses", type: "FLOWER", tagline: "The classic, perfected.", match: (p) => p.flowerType.includes("Rose") },
    { name: "Peonies", slug: "peonies", type: "FLOWER", tagline: "Petal-rich and romantic.", match: (p) => p.flowerType.includes("Peon") },
    { name: "Lilies", slug: "lilies", type: "FLOWER", tagline: "Graceful and serene.", match: (p) => p.flowerType.includes("Lil") },
    { name: "Tulips", slug: "tulips", type: "FLOWER", tagline: "Clean lines, fresh spirit.", match: () => false },
    { name: "Orchids", slug: "orchids", type: "FLOWER", tagline: "Poised and exotic.", match: () => false },
    { name: "Hydrangeas", slug: "hydrangeas", type: "FLOWER", tagline: "Full, cloud-like blooms.", match: () => false },
    { name: "Ranunculus", slug: "ranunculus", type: "FLOWER", tagline: "Layered, delicate petals.", match: () => false },
    { name: "Vases", slug: "vases", type: "TYPE", tagline: "Arranged and ready to display.", match: () => false },
    { name: "Baskets", slug: "baskets", type: "TYPE", tagline: "Gathered, generous, charming.", match: () => false },
    { name: "Gift Sets", slug: "gift-sets", type: "TYPE", tagline: "Flowers, paired with a gift.", match: () => false },
    { name: "Congratulations", slug: "congratulations", type: "OCCASION", tagline: "Celebrate every win.", match: (p) => p.occasion === "Congratulations" },
    { name: "For Him", slug: "for-him", type: "OCCASION", tagline: "Considered, understated florals.", match: () => false },
    { name: "Just Because", slug: "just-because", type: "OCCASION", tagline: "No reason needed.", match: () => false },
  ];

  const seededProducts = await db.select({ id: products.id, tags: products.tags, flowerType: products.flowerType, colour: products.colour, occasion: products.occasion }).from(products);
  let extraCount = 0;
  for (const [i, c] of EXTRA_COLLECTIONS.entries()) {
    const matches = seededProducts.filter((p) =>
      c.match({ flowerType: p.flowerType ?? "", colour: p.colour ?? "", occasion: p.occasion ?? "", tags: p.tags ?? [] })
    );
    const [col] = await db
      .insert(collections)
      .values({ name: c.name, slug: c.slug, type: c.type, tagline: c.tagline, sortOrder: 100 + i, status: matches.length > 0 ? "PUBLISHED" : "DRAFT" })
      .onConflictDoUpdate({ target: collections.slug, set: { type: c.type, tagline: c.tagline } })
      .returning();
    for (const p of matches) {
      await db.insert(productCollections).values({ productId: p.id, collectionId: col.id }).onConflictDoNothing();
    }
    extraCount++;
  }
  console.log(`  ✓ ${extraCount} style / flower / type collections (empty ones left as drafts)`);

  // ---------- Hero slides (illustrated placeholders — replace with real photography) ----------
  const existingSlides = await db.select({ id: heroSlides.id }).from(heroSlides).limit(1);
  if (existingSlides.length === 0) {
    await db.insert(heroSlides).values([
      {
        eyebrow: "KFLORÉ / SEASONAL COLLECTION",
        title: "Flowers, thoughtfully arranged.",
        subtitle: "Timeless floral artistry for life's most meaningful moments.",
        image: PLACEHOLDER("hero-arrangement"),
        primaryCtaLabel: "SHOP FLOWERS",
        primaryCtaHref: "/shop",
        secondaryCtaLabel: "EXPLORE COLLECTIONS",
        secondaryCtaHref: "/collections",
        sortOrder: 0,
      },
      {
        eyebrow: "KFLORÉ / WEDDINGS",
        title: "For moments worth remembering.",
        subtitle: "Bridal bouquets and wedding florals, arranged with care.",
        image: PLACEHOLDER("cat-wedding-flowers"),
        primaryCtaLabel: "WEDDING FLOWERS",
        primaryCtaHref: "/collections/wedding-flowers",
        sortOrder: 1,
        textPosition: "center",
      },
      {
        eyebrow: "KFLORÉ / CELEBRATIONS",
        title: "Make their day bloom.",
        subtitle: "Birthday flowers, delivered same-day across Kuala Lumpur & Klang Valley.",
        image: PLACEHOLDER("cat-birthday-flowers"),
        primaryCtaLabel: "BIRTHDAY FLOWERS",
        primaryCtaHref: "/collections/birthday-flowers",
        sortOrder: 2,
        textPosition: "right",
      },
    ]);
    console.log("  ✓ 3 hero slides");
  }

  // ---------- Signature pick ----------
  const existingPick = await db.select({ id: signaturePicks.id }).from(signaturePicks).limit(1);
  if (existingPick.length === 0) {
    const [pickProduct] = await db.select({ id: products.id }).from(products).where(eq(products.slug, "rose-luxe-box"));
    if (pickProduct) {
      await db.insert(signaturePicks).values({ productId: pickProduct.id, enabled: true });
      console.log("  ✓ Signature pick (Rose Luxe Box) — edit or schedule in /admin/signature-picks");
    }
  }

  // ---------- Site settings + homepage section order ----------
  await db.insert(siteSettings).values({ id: "site" }).onConflictDoNothing();
  for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
    await db.insert(homepageSections).values({ key: s.key, enabled: true, sortOrder: s.sortOrder }).onConflictDoNothing();
  }
  // Old default story headline → new editorial one (only if the admin never changed it).
  await db
    .update(homepage)
    .set({ aboutHeading: "Flowers with feeling." })
    .where(eq(homepage.aboutHeading, "WHERE FLOWERS\nBECOME TIMELESS\nEXPRESSIONS."));

  console.log("  ✓ CMS defaults (homepage, about, delivery, contact, site settings)");
  console.log("\nSeed complete.");
  console.log(`Admin login → ${adminEmail} / (the ADMIN_PASSWORD you set in .env)`);
  process.exit(0);
}

function eqProduct(productId: string) {
  return eq(productImages.productId, productId);
}
function eqProductVariant(productId: string) {
  return eq(productVariants.productId, productId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
