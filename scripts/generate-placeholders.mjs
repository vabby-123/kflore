// Generates elegant, brand-toned SVG placeholder illustrations for
// development/demo use. Every file is clearly a generated placeholder —
// replace via the admin Media Library once real product photography is ready.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PALETTE = {
  burgundy: "#5A1725",
  burgundyLight: "#7A2A3D",
  black: "#151313",
  ivory: "#F5F0E8",
  gold: "#B89A62",
  rose: "#B98282",
  taupe: "#8B7A6D",
};

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

function petal(cx, cy, r, rot, fill, opacity) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.55}" fill="${fill}" opacity="${opacity}" transform="rotate(${rot} ${cx} ${cy})" />`;
}

export function generateFloralSvg({ slug, width = 1200, height = 1500, tone = "ivory" }) {
  const rand = mulberry32(seedFromString(slug));
  const bg = tone === "burgundy" ? PALETTE.burgundy : PALETTE.ivory;
  const accents = [PALETTE.rose, PALETTE.gold, PALETTE.burgundyLight, PALETTE.taupe];

  let shapes = "";
  const blooms = 5 + Math.floor(rand() * 4);
  for (let b = 0; b < blooms; b++) {
    const cx = width * (0.15 + rand() * 0.7);
    const cy = height * (0.15 + rand() * 0.7);
    const baseR = 60 + rand() * 90;
    const petals = 5 + Math.floor(rand() * 3);
    const color = accents[Math.floor(rand() * accents.length)];
    for (let p = 0; p < petals; p++) {
      const rot = (360 / petals) * p + rand() * 10;
      shapes += petal(cx, cy, baseR, rot, color, 0.55 + rand() * 0.25);
    }
    shapes += `<circle cx="${cx}" cy="${cy}" r="${baseR * 0.28}" fill="${PALETTE.gold}" opacity="0.85" />`;
  }

  // fine botanical line strokes for texture
  let lines = "";
  for (let i = 0; i < 10; i++) {
    const x1 = rand() * width;
    const y1 = rand() * height;
    const x2 = x1 + (rand() - 0.5) * 260;
    const y2 = y1 + (rand() - 0.5) * 260;
    lines += `<path d="M${x1},${y1} Q${(x1 + x2) / 2 + (rand() - 0.5) * 80},${(y1 + y2) / 2 + (rand() - 0.5) * 80} ${x2},${y2}" stroke="${
      tone === "burgundy" ? PALETTE.gold : PALETTE.taupe
    }" stroke-width="1.5" fill="none" opacity="0.35" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bg}" />
  ${lines}
  ${shapes}
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="${PALETTE.gold}" stroke-width="1" opacity="0.5" />
</svg>`;
}

const targets = [
  { slug: "hero-arrangement", tone: "ivory", width: 1600, height: 2000 },
  { slug: "about-story", tone: "ivory", width: 1400, height: 1600 },
  { slug: "delivery-banner", tone: "burgundy", width: 1600, height: 1000 },
  { slug: "cat-hand-bouquets", tone: "ivory" },
  { slug: "cat-flower-boxes", tone: "ivory" },
  { slug: "cat-graduation-bouquets", tone: "ivory" },
  { slug: "cat-birthday-flowers", tone: "ivory" },
  { slug: "cat-anniversary-flowers", tone: "ivory" },
  { slug: "cat-sympathy-flowers", tone: "ivory" },
  { slug: "cat-wedding-flowers", tone: "ivory" },
  { slug: "cat-grand-opening-stands", tone: "ivory" },
  { slug: "product-burgundy-romance-1", tone: "ivory" },
  { slug: "product-burgundy-romance-2", tone: "ivory" },
  { slug: "product-blush-garden-1", tone: "ivory" },
  { slug: "product-blush-garden-2", tone: "ivory" },
  { slug: "product-timeless-ivory-1", tone: "ivory" },
  { slug: "product-timeless-ivory-2", tone: "ivory" },
  { slug: "product-rose-luxe-box-1", tone: "ivory" },
  { slug: "product-rose-luxe-box-2", tone: "ivory" },
  { slug: "product-graduation-bloom-1", tone: "ivory" },
  { slug: "product-graduation-bloom-2", tone: "ivory" },
  { slug: "product-anniversary-collection-1", tone: "ivory" },
  { slug: "product-anniversary-collection-2", tone: "ivory" },
  { slug: "product-sympathy-white-lily-1", tone: "ivory" },
  { slug: "product-wedding-cascade-1", tone: "ivory" },
  { slug: "product-grand-opening-stand-1", tone: "ivory" },
];

const outDir = join(process.cwd(), "public", "images", "placeholders");
mkdirSync(outDir, { recursive: true });

for (const t of targets) {
  const svg = generateFloralSvg(t);
  writeFileSync(join(outDir, `${t.slug}.svg`), svg, "utf-8");
}

console.log(`Generated ${targets.length} placeholder illustrations in ${outDir}`);
