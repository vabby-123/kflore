import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { parseBillplzFields, verifyBillplzSignature } from "@/lib/billplz";
import { logAudit } from "@/lib/actions/audit";

export const runtime = "nodejs";

/**
 * Billplz's server-to-server callback — the authoritative source for payment state (the browser
 * redirect to /checkout/confirmation is for the customer's benefit only and is never trusted to
 * mark an order paid). Billplz POSTs `application/x-www-form-urlencoded` and expects a 200 back.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  const { fields, signature } = parseBillplzFields(params);

  if (!fields.id) {
    return NextResponse.json({ error: "Missing bill id" }, { status: 400 });
  }
  if (!signature || !verifyBillplzSignature(fields, signature)) {
    console.error("[billplz webhook] signature verification failed", { billId: fields.id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const [order] = await db.select().from(orders).where(eq(orders.providerBillId, fields.id));
  if (!order) {
    // Acknowledge anyway so Billplz doesn't retry forever for a bill we don't recognise.
    console.error("[billplz webhook] no matching order for bill", fields.id);
    return NextResponse.json({ ok: true });
  }

  const paid = fields.paid === "true" || fields.paid === "1";
  const nextStatus = paid ? "PAID" : fields.state === "due" ? "PENDING" : "FAILED";

  if (order.paymentStatus !== nextStatus) {
    await db
      .update(orders)
      .set({
        paymentStatus: nextStatus,
        paidAt: paid ? new Date() : order.paidAt,
        status: paid ? "CONFIRMED" : order.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
    await logAudit(paid ? "payment-received" : "payment-failed", "order", order.id, fields.id);
    revalidatePath("/admin/payments");
    revalidatePath(`/admin/payments/${order.id}`);
  }

  return NextResponse.json({ ok: true });
}
