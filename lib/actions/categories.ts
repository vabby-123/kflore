"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { categorySchema } from "@/lib/validations/product";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";

export interface FormActionState {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseFormData(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    image: String(formData.get("image") || ""),
    sortOrder: String(formData.get("sortOrder") || "0"),
    status: String(formData.get("status") || "PUBLISHED"),
  };
}

export async function createCategory(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = categorySchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image: data.image || null,
    sortOrder: data.sortOrder,
    status: data.status,
  });

  await logAudit("create", "category", undefined, data.name);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true, message: "Category created." };
}

export async function updateCategory(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const parsed = categorySchema.safeParse(parseFormData(formData));
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  await db
    .update(categories)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image: data.image || null,
      sortOrder: data.sortOrder,
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  await logAudit("update", "category", id, data.name);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true, message: "Category updated." };
}

export async function deleteCategory(id: string) {
  await requireStaff();
  await db.delete(categories).where(eq(categories.id, id));
  await logAudit("delete", "category", id);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
