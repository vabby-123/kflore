/**
 * Copies real photography into /public/images/photos (resized + recompressed) and points the
 * products, collections, hero slides and story image at it.
 *
 *   npx tsx scripts/apply-photos.ts "<folder with source JPGs>"
 *
 * Source files are addressed by their index in the alphabetically sorted list of JPGs in the folder.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { categories, collections, heroSlides, homepage, productCollections, productImages, products } from "../lib/db/schema";

const srcDir = process.argv[2];
if (!srcDir) throw new Error("Pass the source folder as the first argument");
const files = fs.readdirSync(srcDir).filter((f) => /\.jpe?g$/i.test(f)).sort();
const outDir = path.join(process.cwd(), "public", "images", "photos");

const PRODUCTS: Record<string, number[]> = {
  "burgundy-romance": [24, 16],
  "blush-garden": [10, 32],
  "timeless-ivory": [35, 18],
  "rose-luxe-box": [36, 22],
  "graduation-bloom": [12, 13],
  "anniversary-collection": [37, 33],
  "sympathy-white-lily": [38, 43],
  "wedding-cascade": [5, 41],
  "grand-opening-stand": [40, 6],
};
const COLLECTIONS: Record<string, number> = {
  "hand-bouquets": 25,
  "flower-boxes": 26,
  "graduation-bouquets": 13,
  "birthday-flowers": 21,
  "anniversary-flowers": 32,
  "sympathy-flowers": 43,
  "wedding-flowers": 41,
  "grand-opening-stands": 6,
};
const HERO: { title: string; file: number; position: string }[] = [
  { title: "Flowers, thoughtfully arranged.", file: 20, position: "50% 40%" },
  { title: "For moments worth remembering.", file: 42, position: "50% 40%" },
  { title: "Make their day bloom.", file: 31, position: "50% 40%" },
];
const STORY = 39;

// Extra demo products from the strongest unused photos. Names/prices are placeholders to be replaced in the admin.
const NEW_PRODUCTS: { name: string; slug: string; category: string; price: string; images: number[]; occasion: string; flowerType: string; colour: string; bestSeller?: boolean }[] = [
  { name: "Sunrise Tulips", slug: "sunrise-tulips", category: "hand-bouquets", price: "178.00", images: [25, 20], occasion: "Birthday", flowerType: "Tulips", colour: "Blush & White", bestSeller: true },
  { name: "Peony Garden Vase", slug: "peony-garden-vase", category: "hand-bouquets", price: "258.00", images: [15], occasion: "Anniversary", flowerType: "Peonies", colour: "Pink" },
  { name: "Sunflower Hat Box", slug: "sunflower-hat-box", category: "flower-boxes", price: "238.00", images: [26], occasion: "Congratulations", flowerType: "Sunflowers & Roses", colour: "Yellow" },
  { name: "Lavender Dream", slug: "lavender-dream", category: "hand-bouquets", price: "218.00", images: [27], occasion: "Birthday", flowerType: "Lisianthus & Roses", colour: "Lavender" },
  { name: "Citrus Blossom", slug: "citrus-blossom", category: "birthday-flowers", price: "198.00", images: [21], occasion: "Birthday", flowerType: "Orchids & Ranunculus", colour: "Yellow & White" },
  { name: "Serene Blue", slug: "serene-blue", category: "hand-bouquets", price: "208.00", images: [39], occasion: "Wedding", flowerType: "Roses & Lisianthus", colour: "White & Blue" },
  { name: "Autumn Sunflower", slug: "autumn-sunflower", category: "hand-bouquets", price: "228.00", images: [31], occasion: "Birthday", flowerType: "Sunflowers & Roses", colour: "Orange", bestSeller: true },
  { name: "Bridal Wrist Corsage", slug: "bridal-wrist-corsage", category: "wedding-flowers", price: "88.00", images: [34], occasion: "Wedding", flowerType: "Roses", colour: "Champagne" },
  { name: "Calla Boutonniere", slug: "calla-boutonniere", category: "wedding-flowers", price: "48.00", images: [1], occasion: "Wedding", flowerType: "Calla Lily", colour: "Ivory" },
];
const done = new Map<number, string>();
async function publish(i: number): Promise<string> {
  const cached = done.get(i);
  if (cached) return cached;
  const name = `photo-${String(i).padStart(2, "0")}.jpg`;
  await sharp(path.join(srcDir, files[i]))
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, name));
  const url = `/images/photos/${name}`;
  done.set(i, url);
  return url;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  for (const [slug, idxs] of Object.entries(PRODUCTS)) {
    const [p] = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.slug, slug));
    if (!p) continue;
    await db.delete(productImages).where(eq(productImages.productId, p.id));
    for (const [order, i] of idxs.entries()) {
      await db.insert(productImages).values({ productId: p.id, url: await publish(i), altText: p.name, sortOrder: order });
    }
  }
  for (const n of NEW_PRODUCTS) {
    const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, n.category));
    const [p] = await db
      .insert(products)
      .values({
        name: n.name,
        slug: n.slug,
        shortDescription: `${n.flowerType} in ${n.colour.toLowerCase()} tones.`,
        description: `${n.flowerType} arranged in ${n.colour.toLowerCase()} tones. [Demo product — replace name, price and description from the admin panel.]`,
        price: n.price,
        categoryId: cat?.id,
        bestSeller: n.bestSeller ?? false,
        status: "PUBLISHED",
        occasion: n.occasion,
        flowerType: n.flowerType,
        colour: n.colour,
      })
      .onConflictDoUpdate({ target: products.slug, set: { name: n.name } })
      .returning();
    await db.delete(productImages).where(eq(productImages.productId, p.id));
    for (const [order, i] of n.images.entries()) {
      await db.insert(productImages).values({ productId: p.id, url: await publish(i), altText: n.name, sortOrder: order });
    }
    const [col] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, n.category));
    if (col) await db.insert(productCollections).values({ productId: p.id, collectionId: col.id }).onConflictDoNothing();
  }
  for (const [slug, i] of Object.entries(COLLECTIONS)) {
    await db.update(collections).set({ image: await publish(i) }).where(eq(collections.slug, slug));
  }
  for (const h of HERO) {
    const url = await publish(h.file);
    await db.update(heroSlides).set({ image: url, mobileImage: url, objectPosition: h.position }).where(eq(heroSlides.title, h.title));
  }
  await db.update(homepage).set({ aboutImage: await publish(STORY) }).where(eq(homepage.id, "homepage"));

  console.log(`Published ${done.size} photos to ${outDir}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
