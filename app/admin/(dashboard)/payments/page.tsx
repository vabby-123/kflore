import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { MarkPaidButton } from "@/components/admin/mark-paid-button";
import { formatPriceMYR } from "@/lib/utils";
import { isBillplzConfigured } from "@/lib/billplz";

export const dynamic = "force-dynamic";

const PAYMENT_BADGE: Record<string, "gold" | "burgundy" | "muted" | "rose"> = {
  PAID: "gold",
  PENDING: "muted",
  FAILED: "burgundy",
  CANCELLED: "burgundy",
};

const METHOD_LABELS: Record<string, string> = {
  billplz: "Card / FPX",
  tng_qr: "TNG QR",
  duitnow_qr: "DuitNow QR",
  maybank_qr: "Maybank QRPay",
  bank_transfer: "Bank Transfer",
};

export default async function AdminPaymentsPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Payments</h1>
      <p className="max-w-2xl text-sm text-taupe">
        Card/FPX orders are confirmed automatically by Billplz&rsquo;s webhook. QR and bank-transfer orders are manual —
        check your own banking/ewallet app, then use &ldquo;Mark as Paid&rdquo; once the payment has arrived.
      </p>

      {!isBillplzConfigured() && (
        <p className="border border-gold/40 bg-gold/10 p-4 text-sm text-soft-black">
          Card/FPX payment isn&rsquo;t configured — set <code>BILLPLZ_API_KEY</code> and <code>BILLPLZ_COLLECTION_ID</code> to
          enable it. QR and bank-transfer methods are configured separately under Storefront → Payment methods.
        </p>
      )}

      <DataTable
        rows={rows}
        emptyMessage="No online orders yet — they'll appear here once a customer pays via the website."
        columns={[
          {
            header: "Order",
            render: (o) => (
              <Link href={`/admin/payments/${o.id}`} className="focus-ring font-medium hover:text-burgundy">
                {o.id.slice(0, 8).toUpperCase()}
              </Link>
            ),
          },
          {
            header: "Customer",
            render: (o) => (
              <div className="flex flex-col">
                <span className="font-medium text-soft-black">{o.customerName}</span>
                <span className="text-xs text-taupe">{o.phone || o.email}</span>
              </div>
            ),
          },
          { header: "Method", render: (o) => METHOD_LABELS[o.paymentProvider ?? ""] ?? o.paymentProvider ?? "—" },
          { header: "Amount", render: (o) => formatPriceMYR(o.subtotal) },
          { header: "Payment", render: (o) => <Badge variant={PAYMENT_BADGE[o.paymentStatus] ?? "muted"}>{o.paymentStatus}</Badge> },
          { header: "Fulfillment", render: (o) => <OrderStatusSelect id={o.id} status={o.status} /> },
          { header: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString() },
          {
            header: "",
            className: "text-right",
            render: (o) => (o.paymentProvider !== "billplz" && o.paymentStatus === "PENDING" ? <MarkPaidButton id={o.id} /> : null),
          },
        ]}
      />
    </div>
  );
}
