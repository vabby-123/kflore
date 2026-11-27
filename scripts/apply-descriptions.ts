/**
 * Writes real descriptions onto the catalogue (matched by slug) and keeps two sizes: R (formerly "S" / "Regular") and M. L and XL are removed.
 * Safe to run more than once.
 *
 *   npx tsx scripts/apply-descriptions.ts
 *
 * Descriptions are starting copy based on each product's flower type and colour — review them in /admin
 * against the actual arrangement.
 */
import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "../lib/db";
import { products, productVariants } from "../lib/db/schema";

/** slug -> [one-line summary shown under the name, full description] */
const COPY: Record<string, [string, string]> = {
  "anniversary-collection": [
    "Roses and peonies in rose pink, made to celebrate your story.",
    "Soft layers of peonies meet classic roses in a warm rose-pink palette. Full, romantic and generous, this arrangement says the years have only made it better.\n\nPerfect for anniversaries, proposals and the quiet “I still choose you”.",
  ],
  "autumn-sunflower": [
    "Golden sunflowers and orange roses full of warmth.",
    "Bold sunflowers sit among sunset-orange roses and fresh greenery for a bouquet that lights up the room the moment it arrives.\n\nA cheerful choice for birthdays, new beginnings and anyone who could use some sunshine.",
  ],
  "blush-garden": [
    "A soft garden-style bouquet in blush and ivory.",
    "Garden roses in blush and ivory are loosely gathered for a natural, just-picked feel. Gentle in colour and full of texture.\n\nLovely for birthdays, thank-yous and the people who like things understated.",
  ],
  "bridal-wrist-corsage": [
    "A delicate champagne rose corsage for the wrist.",
    "Petite champagne roses finished into a light, comfortable wrist corsage that photographs beautifully and stays elegant from ceremony to dinner.\n\nMade for bridesmaids, mothers of the couple and formal occasions.",
  ],
  "burgundy-romance": [
    "Deep burgundy roses, hand-tied with garden foliage.",
    "Velvety burgundy roses and textured foliage create a rich, moody bouquet with real depth. Hand-tied and wrapped to be given in person.\n\nMade for anniversaries, date nights and saying it without holding back.",
  ],
  "calla-boutonniere": [
    "A clean ivory calla lily boutonniere.",
    "A sculpted calla lily in ivory, neatly finished for the lapel. Minimal, refined and designed to complement any suit.\n\nFor grooms, groomsmen and fathers of the couple.",
  ],
  "citrus-blossom": [
    "Bright orchids and ranunculus in yellow and white.",
    "Layers of ranunculus and airy orchids in fresh citrus tones make a light, lively arrangement with a modern shape.\n\nA happy pick for birthdays and congratulations.",
  ],
  "graduation-bloom": [
    "Sunflowers and roses to mark the big milestone.",
    "Gold sunflowers and ivory roses are arranged to stand out proudly in every graduation photo.\n\nCelebrate the graduate who earned it.",
  ],
  "grand-opening-stand": [
    "A tall statement stand in gold and red.",
    "A generous standing arrangement of seasonal blooms in auspicious gold and red, built to be seen at the entrance.\n\nIdeal for grand openings, launches and business milestones. Add your greeting in the message box for the ribbon or card.",
  ],
  "lavender-dream": [
    "Lisianthus and roses in soft lavender.",
    "Ruffled lisianthus and roses blend in cool lavender shades for a calm, graceful bouquet.\n\nBeautiful for birthdays and for someone who loves a gentle palette.",
  ],
  "peony-garden-vase": [
    "Lush pink blooms arranged in a vase, ready to display.",
    "Full pink blooms are arranged to feel like a garden brought indoors, ready to display as soon as it arrives.\n\nA generous anniversary or housewarming gift.",
  ],
  "rose-luxe-box": [
    "Premium red roses in our signature box.",
    "Red roses set closely in an elegant box for a rich, classic look that needs no vase.\n\nOur signature gift for anniversaries, proposals and Valentine moments.",
  ],
  "serene-blue": [
    "Roses and lisianthus in white and blue.",
    "Crisp white roses and lisianthus with cool blue accents create a fresh, peaceful bouquet.\n\nSuited to weddings, new babies and thoughtful gifting.",
  ],
  "sunflower-hat-box": [
    "Sunflowers and roses presented in a hat box.",
    "Sunflowers and roses in sunny yellow, arranged in a hat box that sits neatly on a desk or table.\n\nA bright way to say congratulations.",
  ],
  "sunrise-tulips": [
    "Blush and white tulips with a clean, modern feel.",
    "Elegant tulips in blush and white are gathered simply so their shape can speak for itself. Tulips keep opening and moving after delivery, which is part of their charm.\n\nPerfect for birthdays and spring-fresh surprises.",
  ],
  "sympathy-white-lily": [
    "A gentle white lily arrangement to express condolences.",
    "White lilies and soft greenery are arranged quietly and respectfully, offering comfort when words are hard to find.\n\nAdd your message and we will include it on the card.",
  ],
  "timeless-ivory": [
    "Ivory roses and lisianthus in an elegant box.",
    "An all-ivory composition of roses and lisianthus in a flower box. Understated, luxurious and suited to any occasion.\n\nA graceful choice for congratulations and corporate gifting.",
  ],
  "wedding-cascade": [
    "A cascading bridal bouquet in ivory and sage.",
    "Ivory blooms fall into trailing sage greenery in a classic cascade shape made to move with you down the aisle.\n\nTalk to us about matching bridesmaid bouquets and boutonnieres.",
  ],
};

async function main() {
  let updated = 0;
  for (const [slug, [shortDescription, description]] of Object.entries(COPY)) {
    const rows = await db
      .update(products)
      .set({ shortDescription, description, updatedAt: new Date() })
      .where(eq(products.slug, slug))
      .returning({ id: products.id });
    updated += rows.length;
  }
  const renamed = await db.update(productVariants).set({ name: "R" }).where(inArray(productVariants.name, ["S", "Regular"])).returning({ id: productVariants.id });
  const removed = await db.delete(productVariants).where(inArray(productVariants.name, ["L", "XL"])).returning({ id: productVariants.id });
  console.log(`Descriptions updated: ${updated}. Sizes renamed to R: ${renamed.length}. L/XL removed: ${removed.length}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
