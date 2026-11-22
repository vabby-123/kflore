export const DEFAULT_HOMEPAGE_SECTIONS = [
  { key: "featured", label: "Featured products (Bestsellers / New in)", sortOrder: 10 },
  { key: "signature", label: "This Month's Signature Pick", sortOrder: 20 },
  { key: "collections", label: "Explore Collections", sortOrder: 30 },
  { key: "about", label: "Brand story", sortOrder: 40 },
  { key: "delivery", label: "Same-day delivery", sortOrder: 50 },
  { key: "journal", label: "Journal", sortOrder: 60 },
  { key: "newsletter", label: "Newsletter", sortOrder: 70 },
] as const;

export type HomepageSectionKey = (typeof DEFAULT_HOMEPAGE_SECTIONS)[number]["key"];
