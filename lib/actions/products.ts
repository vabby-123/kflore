"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productImages, productVariants, productCollections } from "@/lib/db/schema";
import { productSchema } from "@/lib/validations/product";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";
import type { FormActionState } from "./categories";

function parseFormData(formData: FormData) {
  const imagesJson = String(formData.get("imagesJson") || "[]");
  const variantsJson = String(formData.get("variantsJson") || "[]");
  const collectionIdsJson = String(formData.get("collectionIdsJson") || "[]");
  const tagsRaw = String(formData.get("tags") || "");

  return {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    shortDescription: String(formData.get("shortDescription") || ""),
    description: String(formData.get("description") || ""),
    price: String(formData.get("price") || "0"),
    compareAtPrice: formData.get("compareAtPrice") ? String(formData.get("compareAtPrice")) : null,
    categoryId: String(formData.get("categoryId") || ""),
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
    featured: formData.get("featured") === "on",
    bestSeller: formData.get("bestSeller") === "on",
    status: String(formData.get("status") || "PUBLISHED"),
    stockStatus: String(formData.get("stockStatus") || "IN_STOCK"),
    occasion: String(formData.get("occasion") || ""),
    flowerType: String(formData.get("flowerType") || ""),
    colour: String(formData.get("colour") || ""),
    size: String(formData.get("size") || ""),
    deliveryEligible: formData.get("deliveryEligible") === "on",
    images: JSON.parse(imagesJson),
    variants: JSON.parse(variantsJson),
    collectionIds: JSON.parse(collectionIdsJson),
  };
}

export async function createProduct(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = productSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      price: data.price.toFixed(2),
      compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toFixed(2) : null,
      categoryId: data.categoryId || null,
      tags: data.tags,
      featured: data.featured,
      bestSeller: data.bestSeller,
      status: data.status,
      stockStatus: data.stockStatus,
      occasion: data.occasion || null,
      flowerType: data.flowerType || null,
      colour: data.colour || null,
      size: data.size || null,
      deliveryEligible: data.deliveryEligible,
    })
    .returning();

  await syncProductRelations(product.id, data);
  await logAudit("create", "product", product.id, data.name);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, message: "Product created." };
}

export async function updateProduct(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = productSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  await db
    .update(products)
    .set({
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      price: data.price.toFixed(2),
      compareAtPrice: data.compareAtPrice ? data.compareAtPrice.toFixed(2) : null,
      categoryId: data.categoryId || null,
      tags: data.tags,
      featured: data.featured,
      bestSeller: data.bestSeller,
      status: data.status,
      stockStatus: data.stockStatus,
      occasion: data.occasion || null,
      flowerType: data.flowerType || null,
      colour: data.colour || null,
      size: data.size || null,
      deliveryEligible: data.deliveryEligible,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  await syncProductRelations(id, data);
  await logAudit("update", "product", id, data.name);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/");
  return { success: true, message: "Product updated." };
}

async function syncProductRelations(
  productId: string,
  data: { images: { url: string; altText?: string }[]; variants: { name: string; sku?: string; price?: number; stock?: number }[]; collectionIds: string[] }
) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  for (const [i, img] of data.images.entries()) {
    await db.insert(productImages).values({ productId, url: img.url, altText: img.altText || null, sortOrder: i });
  }

  await db.delete(productVariants).where(eq(productVariants.productId, productId));
  for (const v of data.variants) {
    await db.insert(productVariants).values({
      productId,
      name: v.name,
      sku: v.sku || null,
      price: v.price !== undefined ? v.price.toFixed(2) : null,
      stock: v.stock ?? 0,
    });
  }

  await db.delete(productCollections).where(eq(productCollections.productId, productId));
  for (const collectionId of data.collectionIds) {
    await db.insert(productCollections).values({ productId, collectionId }).onConflictDoNothing();
  }
}

export async function deleteProduct(id: string) {
  await requireStaff();
  await db.delete(products).where(eq(products.id, id));
  await logAudit("delete", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function toggleProductFlag(id: string, field: "featured" | "bestSeller" | "status", value: boolean | string) {
  await requireStaff();
  await db
    .update(products)
    .set({ [field]: value, updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
