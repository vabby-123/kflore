"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, products, productVariants } from "@/lib/db/schema";
import { checkoutSchema, type PaymentMethod } from "@/lib/validations/checkout";
import { BillplzError, createBill, isBillplzConfigured } from "@/lib/billplz";
import { getSiteSettings } from "@/lib/db/queries";
import { SITE_URL } from "@/lib/seo";
import { logAudit } from "./audit";
import { evaluateDiscount } from "@/lib/rewards";

export interface CheckoutState {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  /** Billplz's hosted payment page — set only for the `billplz` method; the client navigates here. */
  redirectUrl?: string;
  /** Set for manual methods (QR / bank transfer) — the client routes to the confirmation page itself. */
  orderId?: string;
}

function dateOrNull(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Which manual methods the admin has actually switched on, per current Storefront settings. */
async function availableManualMethods(): Promise<Set<PaymentMethod>> {
  const site = await getSiteSettings();
  const set = new Set<PaymentMethod>();
  if (site.paymentTngQrImage) set.add("tng_qr");
  if (site.paymentDuitnowQrImage) set.add("duitnow_qr");
  if (site.paymentMaybankQrImage) set.add("maybank_qr");
  if (site.paymentBankDetails) set.add("bank_transfer");
  return set;
}

/**
 * Creates an order from the cart, priced server-side, then either opens a Billplz bill (automatic
 * payment) or records the order against a manual method (QR / bank transfer) for the admin to
 * confirm by hand once the transfer lands.
 *
 * Prices are never trusted from the client: every line is re-priced from the product/variant
 * records in the database, so a tampered cart can't change what gets charged.
 */
export async function createCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    itemsRaw = [];
  }

  const parsed = checkoutSchema.safeParse({
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    deliveryAddress: String(formData.get("deliveryAddress") || ""),
    deliveryDate: String(formData.get("deliveryDate") || ""),
    deliveryTimeSlot: String(formData.get("deliveryTimeSlot") || ""),
    cardMessage: String(formData.get("cardMessage") || ""),
    deliveryNotes: String(formData.get("deliveryNotes") || ""),
    discountCode: String(formData.get("discountCode") || ""),
    method: String(formData.get("method") || ""),
    items: itemsRaw,
  });
  if (!parsed.success) {
    return { success: false, message: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const data = parsed.data;

  if (data.method === "billplz") {
    if (!isBillplzConfigured()) {
      return { success: false, message: "Card/FPX payment isn't switched on right now — please choose another payment method." };
    }
  } else {
    const available = await availableManualMethods();
    if (!available.has(data.method)) {
      return { success: false, message: "That payment method isn't available right now — please choose another." };
    }
  }

  // Re-price every line from the database (ignore whatever the client thought the price was).
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
  ]);
  const productById = new Map(productRows.map((p) => [p.id, p]));

  const lines: { productId: string; name: string; variant: string | null; quantity: number; price: number }[] = [];
  for (const item of data.items) {
    const product = productById.get(item.productId);
    if (!product || product.status !== "PUBLISHED") {
      return { success: false, message: `One of the items in your cart is no longer available. Please refresh your cart and try again.` };
    }
    if (product.stockStatus === "OUT_OF_STOCK") {
      return { success: false, message: `"${product.name}" is currently sold out. Please remove it from your cart to continue.` };
    }
    let price = parseFloat(product.price);
    if (item.variant) {
      const variant = variantRows.find((v) => v.productId === product.id && v.name === item.variant);
      if (variant?.price) price = parseFloat(variant.price);
    }
    lines.push({ productId: product.id, name: product.name, variant: item.variant ?? null, quantity: item.quantity, price });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  if (subtotal <= 0) {
    return { success: false, message: "Your cart total must be more than RM 0.00." };
  }

  // Discount code: re-validated here (never trusted from the browser) and limited to one use per email.
  let discountAmount = 0;
  let discountCode: string | null = null;
  if (data.discountCode?.trim()) {
    const d = evaluateDiscount(data.discountCode, subtotal);
    if (!d.valid) return { success: false, message: d.message || "That discount code isn't valid.", fieldErrors: { discountCode: [d.message || "Invalid code"] } };
    if (!data.email) return { success: false, message: "Please enter your email to use a discount code.", fieldErrors: { email: ["Email is required to use a discount code."] } };
    const [used] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.discountCode, d.code), sql`lower(${orders.email}) = ${data.email.trim().toLowerCase()}`))
      .limit(1);
    if (used) return { success: false, message: "This discount code has already been used with that email.", fieldErrors: { discountCode: ["Already used."] } };
    discountAmount = d.amount;
    discountCode = d.code;
  }
  const payable = subtotal - discountAmount;

  const [order] = await db
    .insert(orders)
    .values({
      customerName: data.name,
      phone: data.phone,
      email: data.email || null,
      deliveryAddress: data.deliveryAddress,
      deliveryDate: dateOrNull(data.deliveryDate ?? ""),
      deliveryTimeSlot: data.deliveryTimeSlot || null,
      cardMessage: data.cardMessage || null,
      notes: data.deliveryNotes || null,
      subtotal: payable.toFixed(2),
      discountCode,
      discountAmount: discountAmount.toFixed(2),
      paymentProvider: data.method,
      paymentStatus: "PENDING",
    })
    .returning();

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order.id,
      productId: l.productId,
      name: l.name,
      variant: l.variant,
      quantity: l.quantity,
      price: l.price.toFixed(2),
    }))
  );

  if (data.method !== "billplz") {
    // Manual method: no gateway call — the admin confirms the payment by hand once it arrives.
    await logAudit("create", "order", order.id, `RM ${payable.toFixed(2)} via ${data.method}`);
    return { success: true, orderId: order.id };
  }

  try {
    const bill = await createBill({
      amountCents: Math.round(payable * 100),
      name: data.name,
      email: data.email!,
      mobile: data.phone,
      description: `KFLORÉ order ${order.id}`,
      callbackUrl: `${SITE_URL}/api/webhooks/billplz`,
      redirectUrl: `${SITE_URL}/checkout/confirmation/${order.id}`,
      reference1Label: "Order",
      reference1: order.id,
    });

    await db.update(orders).set({ providerBillId: bill.id, providerUrl: bill.url, updatedAt: new Date() }).where(eq(orders.id, order.id));
    await logAudit("create", "order", order.id, `RM ${payable.toFixed(2)}`);

    return { success: true, redirectUrl: bill.url };
  } catch (err) {
    // The bill couldn't be created — don't leave a dangling, unpayable order behind.
    await db.delete(orders).where(eq(orders.id, order.id));
    console.error("[checkout] Billplz createBill failed", err instanceof BillplzError ? err.body : err);
    return {
      success: false,
      message: "We couldn't start the payment just now. Please try again in a moment, or order via WhatsApp instead.",
    };
  }
}
