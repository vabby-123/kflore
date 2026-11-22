import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

/** Minimal, public status check used by the confirmation page to poll while a webhook is in flight. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db.select({ paymentStatus: orders.paymentStatus }).from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ paymentStatus: order.paymentStatus }, { headers: { "Cache-Control": "no-store" } });
}
