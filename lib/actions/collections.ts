"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { collectionSchema } from "@/lib/validations/product";
import { revalidateStorefront } from "@/lib/revalidate";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";
import type { FormActionState } from "./categories";

function parseFormData(formData: FormData) {
  const position = String(formData.get("homepagePosition") || "");
  return {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    image: String(formData.get("image") || ""),
    heroImage: String(formData.get("heroImage") || ""),
    tagline: String(formData.get("tagline") || ""),
    type: String(formData.get("type") || ""),
    featured: formData.get("featured") === "on",
    homepagePosition: position ? position : null,
    sortOrder: String(formData.get("sortOrder") || "0"),
    status: String(formData.get("status") || "PUBLISHED"),
  };
}

function toRow(data: ReturnType<typeof collectionSchema.parse>) {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image: data.image || null,
    heroImage: data.heroImage || null,
    tagline: data.tagline || null,
    type: data.type,
    featured: data.featured,
    homepagePosition: data.homepagePosition ?? null,
    sortOrder: data.sortOrder,
    status: data.status,
  };
}

export async function createCollection(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = collectionSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await db.insert(collections).values(toRow(parsed.data));

  await logAudit("create", "collection", undefined, parsed.data.name);
  revalidatePath("/admin/collections");
  revalidateStorefront();
  return { success: true, message: "Collection created." };
}

export async function updateCollection(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = collectionSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await db
    .update(collections)
    .set({ ...toRow(parsed.data), updatedAt: new Date() })
    .where(eq(collections.id, id));

  await logAudit("update", "collection", id, parsed.data.name);
  revalidatePath("/admin/collections");
  revalidateStorefront();
  return { success: true, message: "Collection updated." };
}

export async function deleteCollection(id: string) {
  await requireStaff();
  await db.delete(collections).where(eq(collections.id, id));
  await logAudit("delete", "collection", id);
  revalidatePath("/admin/collections");
  revalidateStorefront();
}