"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { heroSlides, homepageSections, journalArticles, signaturePicks, siteSettings } from "@/lib/db/schema";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/homepage-sections";
import { revalidateStorefront } from "@/lib/revalidate";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";
import type { FormActionState } from "./categories";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Links may be site-relative or http(s)/mailto/tel. Blocks `javascript:` and friends. */
const href = z
  .string()
  .trim()
  .refine((v) => v === "" || /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(v), "Use a site path (/shop) or a full https:// link");

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour, e.g. #5A1725");

function fail(error: z.ZodError): FormActionState {
  return { success: false, message: "Please check the highlighted fields.", fieldErrors: error.flatten().fieldErrors as Record<string, string[]> };
}

function dateOrNull(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------- Site settings (announcement, footer, newsletter, homepage sections) ----------

const siteSchema = z.object({
  announcementMessage: z.string().max(160),
  announcementHref: href,
  announcementBg: hex,
  announcementFg: hex,
  footerStatement: z.string().min(1).max(200),
  footerCtaLabel: z.string().min(1).max(40),
  newsletterHeading: z.string().min(1).max(60),
  newsletterText: z.string().min(1).max(240),
  featuredHeading: z.string().min(1).max(80),
  paymentTngQrImage: z.string(),
  paymentDuitnowQrImage: z.string(),
  paymentMaybankQrImage: z.string(),
  paymentBankDetails: z.string().max(600),
});

export async function updateSiteSettings(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = siteSchema.safeParse({
    announcementMessage: str(formData, "announcementMessage"),
    announcementHref: str(formData, "announcementHref"),
    announcementBg: str(formData, "announcementBg"),
    announcementFg: str(formData, "announcementFg"),
    footerStatement: str(formData, "footerStatement"),
    footerCtaLabel: str(formData, "footerCtaLabel"),
    newsletterHeading: str(formData, "newsletterHeading"),
    newsletterText: str(formData, "newsletterText"),
    featuredHeading: str(formData, "featuredHeading"),
    paymentTngQrImage: str(formData, "paymentTngQrImage"),
    paymentDuitnowQrImage: str(formData, "paymentDuitnowQrImage"),
    paymentMaybankQrImage: str(formData, "paymentMaybankQrImage"),
    paymentBankDetails: str(formData, "paymentBankDetails"),
  });
  if (!parsed.success) return fail(parsed.error);

  const values = {
    ...parsed.data,
    announcementHref: parsed.data.announcementHref || null,
    announcementEnabled: formData.get("announcementEnabled") === "on",
    paymentTngQrImage: parsed.data.paymentTngQrImage || null,
    paymentDuitnowQrImage: parsed.data.paymentDuitnowQrImage || null,
    paymentMaybankQrImage: parsed.data.paymentMaybankQrImage || null,
    paymentBankDetails: parsed.data.paymentBankDetails || null,
  };
  await db
    .insert(siteSettings)
    .values({ id: "site", ...values, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.id, set: { ...values, updatedAt: new Date() } });

  for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
    const enabled = formData.get(`section_${s.key}_enabled`) === "on";
    const order = parseInt(str(formData, `section_${s.key}_order`), 10);
    const sortOrder = Number.isFinite(order) ? order : s.sortOrder;
    await db
      .insert(homepageSections)
      .values({ key: s.key, enabled, sortOrder })
      .onConflictDoUpdate({ target: homepageSections.key, set: { enabled, sortOrder } });
  }

  await logAudit("update", "site-settings");
  revalidatePath("/admin/storefront");
  revalidateStorefront();
  return { success: true, message: "Storefront settings saved." };
}

// ---------- Hero slides ----------

const heroSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  eyebrow: z.string().max(80),
  subtitle: z.string().max(240),
  image: z.string().min(1, "A desktop image is required"),
  mobileImage: z.string(),
  primaryCtaLabel: z.string().max(40),
  primaryCtaHref: href,
  secondaryCtaLabel: z.string().max(40),
  secondaryCtaHref: href,
  overlayOpacity: z.coerce.number().int().min(0).max(100),
  textPosition: z.enum(["left", "center", "right"]),
  objectPosition: z.string().regex(/^[a-z0-9% ]{3,30}$/i, "Use e.g. center, top, or 50% 30%"),
  sortOrder: z.coerce.number().int(),
});

function heroValues(formData: FormData) {
  const parsed = heroSchema.safeParse({
    title: str(formData, "title"),
    eyebrow: str(formData, "eyebrow"),
    subtitle: str(formData, "subtitle"),
    image: str(formData, "image"),
    mobileImage: str(formData, "mobileImage"),
    primaryCtaLabel: str(formData, "primaryCtaLabel"),
    primaryCtaHref: str(formData, "primaryCtaHref"),
    secondaryCtaLabel: str(formData, "secondaryCtaLabel"),
    secondaryCtaHref: str(formData, "secondaryCtaHref"),
    overlayOpacity: str(formData, "overlayOpacity") || "35",
    textPosition: str(formData, "textPosition") || "left",
    objectPosition: str(formData, "objectPosition") || "center",
    sortOrder: str(formData, "sortOrder") || "0",
  });
  if (!parsed.success) return { error: fail(parsed.error) } as const;
  const d = parsed.data;
  return {
    values: {
      title: d.title,
      eyebrow: d.eyebrow || null,
      subtitle: d.subtitle || null,
      image: d.image,
      mobileImage: d.mobileImage || null,
      primaryCtaLabel: d.primaryCtaLabel || null,
      primaryCtaHref: d.primaryCtaHref || null,
      secondaryCtaLabel: d.secondaryCtaLabel || null,
      secondaryCtaHref: d.secondaryCtaHref || null,
      overlayOpacity: d.overlayOpacity,
      textPosition: d.textPosition,
      objectPosition: d.objectPosition,
      sortOrder: d.sortOrder,
      active: formData.get("active") === "on",
    },
  } as const;
}

export async function createHeroSlide(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = heroValues(formData);
  if (r.error) return r.error;
  await db.insert(heroSlides).values(r.values);
  await logAudit("create", "hero-slide", undefined, r.values.title);
  revalidatePath("/admin/hero-slides");
  revalidateStorefront();
  redirect("/admin/hero-slides");
}

export async function updateHeroSlide(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = heroValues(formData);
  if (r.error) return r.error;
  await db.update(heroSlides).set({ ...r.values, updatedAt: new Date() }).where(eq(heroSlides.id, id));
  await logAudit("update", "hero-slide", id, r.values.title);
  revalidatePath("/admin/hero-slides");
  revalidateStorefront();
  return { success: true, message: "Slide saved." };
}

export async function deleteHeroSlide(id: string) {
  await requireStaff();
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
  await logAudit("delete", "hero-slide", id);
  revalidatePath("/admin/hero-slides");
  revalidateStorefront();
}

// ---------- Signature picks ----------

const pickSchema = z.object({
  productId: z.string(),
  eyebrow: z.string().trim().min(1).max(60),
  title: z.string().max(120),
  description: z.string().max(600),
  occasion: z.string().max(120),
  palette: z.string().max(120),
  featuredFlowers: z.string().max(200),
  imageOverride: z.string(),
  ctaText: z.string().trim().min(1).max(40),
  startDate: z.string(),
  endDate: z.string(),
});

function pickValues(formData: FormData) {
  const parsed = pickSchema.safeParse({
    productId: str(formData, "productId"),
    eyebrow: str(formData, "eyebrow") || "KFLORÉ SIGNATURE",
    title: str(formData, "title"),
    description: str(formData, "description"),
    occasion: str(formData, "occasion"),
    palette: str(formData, "palette"),
    featuredFlowers: str(formData, "featuredFlowers"),
    imageOverride: str(formData, "imageOverride"),
    ctaText: str(formData, "ctaText") || "DISCOVER THE SIGNATURE",
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
  });
  if (!parsed.success) return { error: fail(parsed.error) } as const;
  const d = parsed.data;
  const startDate = dateOrNull(d.startDate);
  const endDate = dateOrNull(d.endDate);
  if (startDate && endDate && endDate <= startDate) {
    return { error: { success: false, message: "The end date must be after the start date." } as FormActionState } as const;
  }
  if (!d.productId && !d.title) {
    return { error: { success: false, message: "Choose a product, or enter a title." } as FormActionState } as const;
  }
  return {
    values: {
      enabled: formData.get("enabled") === "on",
      productId: d.productId || null,
      eyebrow: d.eyebrow,
      title: d.title || null,
      description: d.description || null,
      occasion: d.occasion || null,
      palette: d.palette || null,
      featuredFlowers: d.featuredFlowers || null,
      imageOverride: d.imageOverride || null,
      ctaText: d.ctaText,
      startDate,
      endDate,
    },
  } as const;
}

export async function createSignaturePick(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = pickValues(formData);
  if (r.error) return r.error;
  await db.insert(signaturePicks).values(r.values);
  await logAudit("create", "signature-pick", undefined, r.values.title ?? undefined);
  revalidatePath("/admin/signature-picks");
  revalidateStorefront();
  redirect("/admin/signature-picks");
}

export async function updateSignaturePick(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = pickValues(formData);
  if (r.error) return r.error;
  await db.update(signaturePicks).set({ ...r.values, updatedAt: new Date() }).where(eq(signaturePicks.id, id));
  await logAudit("update", "signature-pick", id);
  revalidatePath("/admin/signature-picks");
  revalidateStorefront();
  return { success: true, message: "Signature pick saved." };
}

export async function deleteSignaturePick(id: string) {
  await requireStaff();
  await db.delete(signaturePicks).where(eq(signaturePicks.id, id));
  await logAudit("delete", "signature-pick", id);
  revalidatePath("/admin/signature-picks");
  revalidateStorefront();
}

// ---------- Journal ----------

const articleSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  category: z.string().max(60),
  excerpt: z.string().max(300),
  body: z.string(),
  image: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string(),
});

function articleValues(formData: FormData) {
  const parsed = articleSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    category: str(formData, "category"),
    excerpt: str(formData, "excerpt"),
    body: String(formData.get("body") ?? ""),
    image: str(formData, "image"),
    status: str(formData, "status") || "DRAFT",
    publishedAt: str(formData, "publishedAt"),
  });
  if (!parsed.success) return { error: fail(parsed.error) } as const;
  const d = parsed.data;
  return {
    values: {
      title: d.title,
      slug: d.slug,
      category: d.category || null,
      excerpt: d.excerpt || null,
      body: d.body || null,
      image: d.image || null,
      status: d.status,
      publishedAt: dateOrNull(d.publishedAt) ?? (d.status === "PUBLISHED" ? new Date() : null),
    },
  } as const;
}

export async function createArticle(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = articleValues(formData);
  if (r.error) return r.error;
  try {
    await db.insert(journalArticles).values(r.values);
  } catch {
    return { success: false, fieldErrors: { slug: ["That slug is already used by another article."] } };
  }
  await logAudit("create", "journal", undefined, r.values.title);
  revalidatePath("/admin/journal");
  revalidateStorefront();
  redirect("/admin/journal");
}

export async function updateArticle(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const r = articleValues(formData);
  if (r.error) return r.error;
  try {
    await db.update(journalArticles).set({ ...r.values, updatedAt: new Date() }).where(eq(journalArticles.id, id));
  } catch {
    return { success: false, fieldErrors: { slug: ["That slug is already used by another article."] } };
  }
  await logAudit("update", "journal", id, r.values.title);
  revalidatePath("/admin/journal");
  revalidateStorefront();
  return { success: true, message: "Article saved." };
}

export async function deleteArticle(id: string) {
  await requireStaff();
  await db.delete(journalArticles).where(eq(journalArticles.id, id));
  await logAudit("delete", "journal", id);
  revalidatePath("/admin/journal");
  revalidateStorefront();
}
