"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireStaff } from "./guard";
import { logAudit } from "./audit";
import { awardPointsForOrder } from "@/lib/rewards-server";

type OrderStatusValue = "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

/** Updates fulfillment status only — payment status for Billplz orders is set exclusively by its webhook. */
export async function updateOrderFulfillmentStatus(id: string, status: OrderStatusValue) {
  await requireStaff();
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  await logAudit("update-status", "order", id, status);
  revalidatePath("/admin/payments");
  revalidatePath(`/admin/payments/${id}`);
}

/**
 * Manual payment methods (QR codes, bank transfer) have no gateway to confirm them automatically —
 * the admin checks their own banking/ewallet app and marks the order paid here. Refuses to touch
 * Billplz orders, whose payment status must only ever come from its webhook.
 */
export async function markOrderPaidManually(id: string) {
  await requireStaff();
  const [order] = await db.select({ paymentProvider: orders.paymentProvider }).from(orders).where(eq(orders.id, id));
  if (!order) throw new Error("Order not found");
  if (order.paymentProvider === "billplz") throw new Error("Billplz orders are confirmed automatically and can't be marked paid by hand.");

  await db.update(orders).set({ paymentStatus: "PAID", paidAt: new Date(), status: "CONFIRMED", updatedAt: new Date() }).where(eq(orders.id, id));
  await awardPointsForOrder(id);
  await logAudit("mark-paid", "order", id);
  revalidatePath("/admin/payments");
  revalidatePath(`/admin/payments/${id}`);
}
