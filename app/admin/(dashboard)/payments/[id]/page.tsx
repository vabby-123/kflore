import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { MarkPaidButton } from "@/components/admin/mark-paid-button";
import { formatPriceMYR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAYMENT_BADGE: Record<string, "gold" | "burgundy" | "muted" | "rose"> = {
  PAID: "gold",
  PENDING: "muted",
  FAILED: "burgundy",
  CANCELLED: "burgundy",
};

const METHOD_LABELS: Record<string, string> = {
  billplz: "Card / FPX Online Banking",
  tng_qr: "Touch 'n Go eWallet (QR)",
  duitnow_qr: "DuitNow QR",
  maybank_qr: "Maybank QRPay",
  bank_transfer: "Bank Transfer",
};

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const billplzDashboardUrl =
    order.paymentProvider === "billplz" && order.providerBillId
      ? `https://www.billplz${process.env.BILLPLZ_SANDBOX === "false" ? "" : "-sandbox"}.com/bills/${order.providerBillId}`
      : null;
  const canMarkPaid = order.paymentProvider !== "billplz" && order.paymentStatus === "PENDING";

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Order {order.id.slice(0, 8).toUpperCase()}</h1>
        <div className="flex items-center gap-3">
          <Badge variant={PAYMENT_BADGE[order.paymentStatus] ?? "muted"}>{order.paymentStatus}</Badge>
          {canMarkPaid && <MarkPaidButton id={order.id} />}
        </div>
      </div>

      <div className="grid gap-6 border border-taupe/15 bg-white p-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Customer</span>
          <span className="text-sm text-soft-black">{order.customerName}</span>
          <span className="text-sm text-soft-black">{order.phone}</span>
          <span className="text-sm text-soft-black">{order.email}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Delivery</span>
          <span className="whitespace-pre-line text-sm text-soft-black">{order.deliveryAddress || "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Preferred date / time</span>
          <span className="text-sm text-soft-black">
            {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            {order.deliveryTimeSlot ? ` · ${order.deliveryTimeSlot}` : ""}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Payment method</span>
          <span className="text-sm text-soft-black">{METHOD_LABELS[order.paymentProvider ?? ""] ?? order.paymentProvider ?? "—"}</span>
        </div>
        {order.cardMessage && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs uppercase tracking-label text-taupe">Message on the card</span>
            <span className="whitespace-pre-line text-sm text-soft-black">{order.cardMessage}</span>
          </div>
        )}
        {order.notes && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs uppercase tracking-label text-taupe">Delivery notes</span>
            <span className="whitespace-pre-line text-sm text-soft-black">{order.notes}</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Fulfillment status</span>
          <OrderStatusSelect id={order.id} status={order.status} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-label text-taupe">Paid at</span>
          <span className="text-sm text-soft-black">{order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}</span>
        </div>
        {billplzDashboardUrl && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs uppercase tracking-label text-taupe">Billplz bill</span>
            <a href={billplzDashboardUrl} target="_blank" rel="noopener noreferrer" className="focus-ring text-sm text-burgundy underline underline-offset-4">
              {order.providerBillId}
            </a>
          </div>
        )}
      </div>

      <div className="border border-taupe/15 bg-white p-6">
        <h2 className="mb-4 font-serif-display text-lg text-soft-black">Items</h2>
        <ul className="flex flex-col divide-y divide-taupe/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.quantity} × {item.name}
                {item.variant && <span className="text-taupe"> ({item.variant})</span>}
              </span>
              <span className="text-soft-black">{formatPriceMYR((parseFloat(item.price) * item.quantity).toFixed(2))}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-taupe/20 pt-4 text-sm font-medium">
          <span>Total</span>
          <span>{formatPriceMYR(order.subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
