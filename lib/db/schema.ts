import {
  pgTable,
  pgEnum,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const id = () => text("id").primaryKey().$defaultFn(() => createId());

// ---------- Enums ----------
export const roleEnum = pgEnum("role", ["ADMIN", "EDITOR"]);
export const productStatusEnum = pgEnum("product_status", ["DRAFT", "PUBLISHED"]);
export const stockStatusEnum = pgEnum("stock_status", [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "MADE_TO_ORDER",
]);
export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);
export const enquirySourceEnum = pgEnum("enquiry_source", [
  "CONTACT_FORM",
  "WHATSAPP_CART",
  "WHATSAPP_PRODUCT",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);
/** Status of the money, as reported by the payment gateway — separate from `order_status`, which tracks fulfillment. */
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
]);

// ---------- Users / Auth ----------
export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("EDITOR"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ---------- Categories / Collections ----------
export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: productStatusEnum("status").notNull().default("PUBLISHED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
}));

export const collections = pgTable("collections", {
  id: id(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image"),
  heroImage: text("hero_image"),
  /** Short descriptor shown on editorial collection tiles, e.g. "Celebrate your story." */
  tagline: text("tagline"),
  /** OCCASION | TYPE | STYLE | FLOWER, or any custom label an admin invents. */
  type: text("type").notNull().default("OCCASION"),
  featured: boolean("featured").notNull().default(false),
  homepagePosition: integer("homepage_position"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: productStatusEnum("status").notNull().default("PUBLISHED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  slugIdx: uniqueIndex("collections_slug_idx").on(t.slug),
  typeIdx: index("collections_type_idx").on(t.type),
  featuredIdx: index("collections_featured_idx").on(t.featured),
}));

// ---------- Products ----------
export const products = pgTable("products", {
  id: id(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  bestSeller: boolean("best_seller").notNull().default(false),
  status: productStatusEnum("status").notNull().default("PUBLISHED"),
  stockStatus: stockStatusEnum("stock_status").notNull().default("IN_STOCK"),
  occasion: text("occasion"),
  flowerType: text("flower_type"),
  colour: text("colour"),
  size: text("size"),
  deliveryEligible: boolean("delivery_eligible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  slugIdx: uniqueIndex("products_slug_idx").on(t.slug),
  categoryIdx: index("products_category_idx").on(t.categoryId),
  featuredIdx: index("products_featured_idx").on(t.featured),
  bestSellerIdx: index("products_best_seller_idx").on(t.bestSeller),
  statusIdx: index("products_status_idx").on(t.status),
  createdIdx: index("products_created_idx").on(t.createdAt),
}));

export const productImages = pgTable("product_images", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  productIdx: index("product_images_product_idx").on(t.productId),
}));

export const productVariants = pgTable("product_variants", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  price: numeric("price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  productIdx: index("product_variants_product_idx").on(t.productId),
}));

export const productCollections = pgTable("product_collections", {
  id: id(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  collectionId: text("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
}, (t) => ({
  uniq: uniqueIndex("product_collections_uniq").on(t.productId, t.collectionId),
}));

// ---------- Orders / Enquiries ----------
export const enquiries = pgTable("enquiries", {
  id: id(),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  message: text("message"),
  interestedProduct: text("interested_product"),
  deliveryArea: text("delivery_area"),
  deliveryDate: timestamp("delivery_date"),
  estimatedValue: numeric("estimated_value", { precision: 10, scale: 2 }),
  source: enquirySourceEnum("source").notNull().default("CONTACT_FORM"),
  status: enquiryStatusEnum("status").notNull().default("NEW"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  statusIdx: index("enquiries_status_idx").on(t.status),
  createdIdx: index("enquiries_created_idx").on(t.createdAt),
}));

export const orders = pgTable("orders", {
  id: id(),
  enquiryId: text("enquiry_id").references(() => enquiries.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  deliveryArea: text("delivery_area"),
  deliveryAddress: text("delivery_address"),
  /** Customer's preferred delivery date, from the "Please select your preferred date/time" checkout section. */
  deliveryDate: timestamp("delivery_date"),
  /** Free text, e.g. "Morning (9am–12pm)" — kept as text so admins can edit the slot options without a migration. */
  deliveryTimeSlot: text("delivery_time_slot"),
  /** Gift message to write on the card, separate from internal delivery notes. */
  cardMessage: text("card_message"),
  status: orderStatusEnum("status").notNull().default("NEW"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  // ---- Payment: Billplz (automatic) or a manual method (customer pays by QR/transfer, admin confirms by hand) ----
  paymentProvider: text("payment_provider"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
  providerBillId: text("provider_bill_id"),
  providerUrl: text("provider_url"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  statusIdx: index("orders_status_idx").on(t.status),
  createdIdx: index("orders_created_idx").on(t.createdAt),
  paymentStatusIdx: index("orders_payment_status_idx").on(t.paymentStatus),
  providerBillIdx: uniqueIndex("orders_provider_bill_idx").on(t.providerBillId),
}));

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  name: text("name").notNull(),
  variant: text("variant"),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
}, (t) => ({
  orderIdx: index("order_items_order_idx").on(t.orderId),
}));

// ---------- CMS Singletons ----------
export const homepage = pgTable("homepage", {
  id: text("id").primaryKey().default("homepage"),
  aboutHeading: text("about_heading").notNull().default("WHERE FLOWERS\nBECOME TIMELESS\nEXPRESSIONS."),
  aboutExcerpt: text("about_excerpt"),
  aboutImage: text("about_image"),
  instagramEnabled: boolean("instagram_enabled").notNull().default(false),
  instagramHandle: text("instagram_handle"),
  testimonialsEnabled: boolean("testimonials_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aboutPage = pgTable("about_page", {
  id: text("id").primaryKey().default("about"),
  familyFlorist: boolean("family_florist").notNull().default(true),
  yearsOfExperience: integer("years_of_experience"),
  founderName: text("founder_name").default("Keshwini Ganesan"),
  story: text("story"),
  mission: text("mission"),
  values: text("values").array().notNull().default([]),
  image: text("image"),
  additionalImages: text("additional_images").array().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliverySettings = pgTable("delivery_settings", {
  id: text("id").primaryKey().default("delivery"),
  areas: text("areas").notNull().default("Kuala Lumpur & Selangor"),
  excludedAreas: text("excluded_areas"),
  sameDayAvailable: boolean("same_day_available").notNull().default(true),
  charges: text("charges"),
  orderCutOffTime: text("order_cut_off_time"),
  deliveryNotes: text("delivery_notes"),
  publicHolidayNotes: text("public_holiday_notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactSettings = pgTable("contact_settings", {
  id: text("id").primaryKey().default("contact"),
  businessName: text("business_name").notNull().default("KFLORÉ"),
  whatsapp: text("whatsapp"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  openingHours: text("opening_hours"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  tiktok: text("tiktok"),
  logoUrl: text("logo_url"),
  currency: text("currency").notNull().default("MYR"),
  timezone: text("timezone").notNull().default("Asia/Kuala_Lumpur"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Homepage CMS: hero slides, signature pick, journal, site settings ----------
export const heroSlides = pgTable("hero_slides", {
  id: id(),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  mobileImage: text("mobile_image"),
  primaryCtaLabel: text("primary_cta_label"),
  primaryCtaHref: text("primary_cta_href"),
  secondaryCtaLabel: text("secondary_cta_label"),
  secondaryCtaHref: text("secondary_cta_href"),
  overlayOpacity: integer("overlay_opacity").notNull().default(35),
  textPosition: text("text_position").notNull().default("left"),
  objectPosition: text("object_position").notNull().default("center"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  activeSortIdx: index("hero_slides_active_sort_idx").on(t.active, t.sortOrder),
}));

/** One row per featured month. The storefront shows the row whose window contains "now". */
export const signaturePicks = pgTable("signature_picks", {
  id: id(),
  enabled: boolean("enabled").notNull().default(true),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  eyebrow: text("eyebrow").notNull().default("KFLORÉ SIGNATURE"),
  title: text("title"),
  description: text("description"),
  occasion: text("occasion"),
  palette: text("palette"),
  featuredFlowers: text("featured_flowers"),
  imageOverride: text("image_override"),
  ctaText: text("cta_text").notNull().default("DISCOVER THE SIGNATURE"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  enabledIdx: index("signature_picks_enabled_idx").on(t.enabled, t.startDate),
}));

export const journalArticles = pgTable("journal_articles", {
  id: id(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  category: text("category"),
  excerpt: text("excerpt"),
  body: text("body"),
  image: text("image"),
  status: productStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  slugIdx: uniqueIndex("journal_articles_slug_idx").on(t.slug),
  statusIdx: index("journal_articles_status_idx").on(t.status, t.publishedAt),
}));

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: id(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("newsletter_subscribers_email_idx").on(t.email),
}));

/** Ordering + visibility of the homepage's content sections (hero and trust strip are fixed). */
export const homepageSections = pgTable("homepage_sections", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("site"),
  announcementEnabled: boolean("announcement_enabled").notNull().default(true),
  announcementMessage: text("announcement_message").notNull().default("Same-Day Delivery • Kuala Lumpur & Selangor"),
  announcementHref: text("announcement_href"),
  announcementBg: text("announcement_bg").notNull().default("#5A1725"),
  announcementFg: text("announcement_fg").notNull().default("#F5F0E8"),
  footerStatement: text("footer_statement").notNull().default("Thoughtfully arranged flowers for life's meaningful moments."),
  footerCtaLabel: text("footer_cta_label").notNull().default("TALK TO US"),
  newsletterHeading: text("newsletter_heading").notNull().default("Stay in Bloom"),
  newsletterText: text("newsletter_text").notNull().default(
    "Receive new collection launches, seasonal flowers and special moments from KFLORÉ."
  ),
  featuredHeading: text("featured_heading").notNull().default("Elegance in Bloom"),
  // ---- Manual payment methods (checkout always offers these — no gateway account needed) ----
  paymentTngQrImage: text("payment_tng_qr_image"),
  paymentDuitnowQrImage: text("payment_duitnow_qr_image"),
  paymentMaybankQrImage: text("payment_maybank_qr_image"),
  /** Free text: bank name, account number, account holder name. Shown as-is at checkout. */
  paymentBankDetails: text("payment_bank_details"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Media / Audit ----------
export const media = pgTable("media", {
  id: id(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  thumbnailUrl: text("thumbnail_url"),
  usedIn: text("used_in"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  createdIdx: index("media_created_idx").on(t.createdAt),
}));

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  createdIdx: index("audit_logs_created_idx").on(t.createdAt),
  userIdx: index("audit_logs_user_idx").on(t.userId),
}));

// ---------- Relations ----------
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
  collections: many(productCollections),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(productCollections),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, { fields: [productCollections.productId], references: [products.id] }),
  collection: one(collections, { fields: [productCollections.collectionId], references: [collections.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  enquiry: one(enquiries, { fields: [orders.enquiryId], references: [enquiries.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
