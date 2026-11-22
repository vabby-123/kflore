"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "./guard";
import { logAudit } from "./audit";
import type { FormActionState } from "./categories";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: z.string().min(8).optional().or(z.literal("")),
});

export async function createUser(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin();

  const parsed = userSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || "").toLowerCase(),
    role: String(formData.get("role") || "EDITOR"),
    password: String(formData.get("password") || ""),
  });
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  if (!parsed.data.password) {
    return { success: false, fieldErrors: { password: ["Password is required for a new user"] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    passwordHash,
  });

  await logAudit("create", "user", undefined, parsed.data.email);
  revalidatePath("/admin/users");
  return { success: true, message: "User created." };
}

export async function updateUser(id: string, _prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin();

  const parsed = userSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || "").toLowerCase(),
    role: String(formData.get("role") || "EDITOR"),
    password: String(formData.get("password") || ""),
  });
  if (!parsed.success) return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const updateValues: Partial<typeof users.$inferInsert> = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    updatedAt: new Date(),
  };
  if (parsed.data.password) {
    updateValues.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  await db.update(users).set(updateValues).where(eq(users.id, id));
  await logAudit("update", "user", id, parsed.data.email);
  revalidatePath("/admin/users");
  return { success: true, message: "User updated." };
}

export async function toggleUserActive(id: string, active: boolean) {
  await requireAdmin();
  await db.update(users).set({ active, updatedAt: new Date() }).where(eq(users.id, id));
  await logAudit(active ? "activate" : "deactivate", "user", id);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await db.delete(users).where(eq(users.id, id));
  await logAudit("delete", "user", id);
  revalidatePath("/admin/users");
}
