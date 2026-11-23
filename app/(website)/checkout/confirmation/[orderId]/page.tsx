import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusPoller } from "@/components/website/order-status-poller";
import { getContactContent, getOrderForConfirmation } from "@/lib/db/queries";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPriceMYR } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Order Confirmation", description: "Your KFLORÉ order status.", path: "/checkout/confirmation" });

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const [order, contact] = await Promise.all([getOrderForConfirmation(orderId), getContactContent()]);
  if (!order) notFound();

  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "601160515983";
  const whatsappHref = buildWhatsAppUrl(
    whatsappNumber,
    `Hi KFLORÉ, I'd like to check on my order ${order.id.slice(0, 8).toUpperCase()}.`
  );
  // Billplz's webhook will flip this automatically; a manual method (QR/bank transfer) is
  // confirmed by hand from the admin, so there's nothing to poll for.
  const isManualMethod = order.paymentProvider !== "billplz";

  return (
    <div className="container-kflore page-section">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
        {order.paymentStatus === "PAID" ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-burgundy" aria-hidden="true" />
            <div className="flex flex-col gap-3">
              <h1 className="font-serif-display text-4xl leading-[1.1]">Thank you, {order.customerName.split(" ")[0]}.</h1>
              <p className="text-base text-taupe">Your payment has been received and your order is confirmed.</p>
            </div>
          </>
        ) : order.paymentStatus === "PENDING" && isManualMethod ? (
          <>
            <Clock className="h-12 w-12 text-burgundy" aria-hidden="true" />
            <div className="flex flex-col gap-3">
              <h1 className="font-serif-display text-4xl leading-[1.1]">Order received, {order.customerName.split(" ")[0]}.</h1>
              <p className="text-base text-taupe">
                We&rsquo;ve recorded your order. Please pay using the method you chose, then send your payment receipt to us on
                WhatsApp so we can confirm it quickly. If you haven&rsquo;t received our payment details yet, message us below.
              </p>
            </div>
          </>
        ) : order.paymentStatus === "PENDING" ? (
          <>
            <div className="h-12 w-12 animate-pulse rounded-full border-2 border-burgundy" aria-hidden="true" />
            <div className="flex flex-col gap-3">
              <h1 className="font-serif-display text-4xl leading-[1.1]">One moment…</h1>
              <OrderStatusPoller orderId={order.id} />
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-burgundy" aria-hidden="true" />
            <div className="flex flex-col gap-3">
              <h1 className="font-serif-display text-4xl leading-[1.1]">Payment not completed</h1>
              <p className="text-base text-taupe">Your payment didn&rsquo;t go through, so this order hasn&rsquo;t been placed. No charge was made.</p>
            </div>
          </>
        )}

        {(order.deliveryDate || order.deliveryTimeSlot || order.cardMessage) && (
          <dl className="w-full divide-y divide-taupe/20 border-y border-taupe/20 text-left text-sm">
            {order.deliveryDate && (
              <div className="flex items-center justify-between py-3">
                <dt className="text-taupe">Delivery date</dt>
                <dd className="text-soft-black">{new Date(order.deliveryDate).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
            )}
            {order.deliveryTimeSlot && (
              <div className="flex items-center justify-between py-3">
                <dt className="text-taupe">Preferred time</dt>
                <dd className="text-soft-black">{order.deliveryTimeSlot}</dd>
              </div>
            )}
            {order.cardMessage && (
              <div className="flex flex-col gap-1 py-3">
                <dt className="text-taupe">Message on the card</dt>
                <dd className="whitespace-pre-line text-soft-black">{order.cardMessage}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="w-full divide-y divide-taupe/20 border-y border-taupe/20 text-left">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.quantity} × {item.name}
                {item.variant && <span className="text-taupe"> ({item.variant})</span>}
              </span>
              <span className="text-soft-black">{formatPriceMYR((parseFloat(item.price) * item.quantity).toFixed(2))}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 text-sm font-medium">
            <span>Total</span>
            <span>{formatPriceMYR(order.subtotal)}</span>
          </div>
        </div>

        <p className="text-xs text-taupe">
          Order reference: <span className="font-medium text-soft-black">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className={buttonVariants({ variant: "secondary" })}>
            Continue shopping
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
            Message us about delivery
          </a>
        </div>
      </div>
    </div>
  );
}
