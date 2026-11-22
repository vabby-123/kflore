"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";

export async function deleteMedia(id: string) {
  await requireStaff();
  await db.delete(media).where(eq(media.id, id));
  await logAudit("delete", "media", id);
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, altText: string) {
  await requireStaff();
  await db.update(media).set({ altText }).where(eq(media.id, id));
  revalidatePath("/admin/media");
}
