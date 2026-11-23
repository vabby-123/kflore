import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, rewardLedger, rewardMembers } from "@/lib/db/schema";
import { POINTS_PER_RM } from "@/lib/rewards";

/**
 * Credits Flower Points for a paid order — once only (a unique index on order + reason makes repeats a no-op).
 * Points go to the member whose email matches the order's email; no member, no points.
 */
export async function awardPointsForOrder(orderId: string): Promise<number> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order?.email || order.paymentStatus !== "PAID") return 0;

  const [member] = await db.select().from(rewardMembers).where(eq(rewardMembers.email, order.email.trim().toLowerCase()));
  if (!member) return 0;

  const points = Math.floor(parseFloat(order.subtotal) * POINTS_PER_RM);
  if (points <= 0) return 0;

  const inserted = await db
    .insert(rewardLedger)
    .values({ memberId: member.id, points, reason: "Order purchase", orderId })
    .onConflictDoNothing()
    .returning({ id: rewardLedger.id });
  if (inserted.length === 0) return 0;

  await db
    .update(rewardMembers)
    .set({ points: sql`${rewardMembers.points} + ${points}` })
    .where(eq(rewardMembers.id, member.id));
  return points;
}
