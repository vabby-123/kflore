"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";

type EnquiryStatusValue = "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export async function updateEnquiryStatus(id: string, status: EnquiryStatusValue) {
  await requireStaff();
  await db.update(enquiries).set({ status, updatedAt: new Date() }).where(eq(enquiries.id, id));
  await logAudit("update-status", "enquiry", id, status);
  revalidatePath("/admin/orders");
}

export async function updateEnquiryNotes(id: string, internalNotes: string) {
  await requireStaff();
  await db.update(enquiries).set({ internalNotes, updatedAt: new Date() }).where(eq(enquiries.id, id));
  revalidatePath("/admin/orders");
}
