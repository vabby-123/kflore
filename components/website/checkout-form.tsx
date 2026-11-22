"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { useCart } from "@/lib/cart/cart-context";
import { createCheckout, type CheckoutState } from "@/lib/actions/checkout";
import { DELIVERY_TIME_SLOTS, type PaymentMethod } from "@/lib/validations/checkout";
import { buildCartOrderMessage } from "@/lib/whatsapp";
import { formatPriceMYR } from "@/lib/utils";

const initialState: CheckoutState = { success: false };

interface ManualMethods {
  tng_qr: string | null;
  duitnow_qr: string | null;
  maybank_qr: string | null;
  bank_transfer: string | null;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  billplz: "Card / FPX Online Banking",
  tng_qr: "Touch 'n Go eWallet (QR)",
  duitnow_qr: "DuitNow QR",
  maybank_qr: "Maybank QRPay",
  bank_transfer: "Bank Transfer",
};

export function CheckoutForm({
  whatsappNumber,
  billplzEnabled,
  manualMethods,
}: {
  whatsappNumber: string;
  billplzEnabled: boolean;
  manualMethods: ManualMethods;
}) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createCheckout, initialState);

  const availableMethods = useMemo<PaymentMethod[]>(() => {
    const list: PaymentMethod[] = [];
    if (billplzEnabled) list.push("billplz");
    if (manualMethods.tng_qr) list.push("tng_qr");
    if (manualMethods.duitnow_qr) list.push("duitnow_qr");
    if (manualMethods.maybank_qr) list.push("maybank_qr");
    if (manualMethods.bank_transfer) list.push("bank_transfer");
    return list;
  }, [billplzEnabled, manualMethods]);

  const [method, setMethod] = useState<PaymentMethod | undefined>(availableMethods[0]);
  const qrImage = method && method !== "billplz" && method !== "bank_transfer" ? manualMethods[method] : null;

  const itemsJson = useMemo(
    () => JSON.stringify(items.map((i) => ({ productId: i.productId, variant: i.variant ?? null, quantity: i.quantity }))),
    [items]
  );
  const whatsappMessage = buildCartOrderMessage({
    items: items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, price: i.price })),
    subtotal,
  });

  useEffect(() => {
    if (!state.success) {
      if (state.message && !state.fieldErrors) toast.error(state.message);
      return;
    }
    clearCart();
    if (state.redirectUrl) {
      window.location.href = state.redirectUrl;
    } else if (state.orderId) {
      router.push(`/checkout/confirmation/${state.orderId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire only when the action result changes
  }, [state]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-taupe">Your cart is empty.</p>
        <Link href="/shop" className={buttonVariants({ variant: "secondary" })}>
          Shop flowers
        </Link>
      </div>
    );
  }

  if (!method) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-taupe">No payment method is available right now — please order via WhatsApp instead.</p>
        <WhatsAppButton phoneNumber={whatsappNumber} message={whatsappMessage} />
      </div>
    );
  }

  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const isManual = method !== "billplz";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="items" value={itemsJson} />
        <input type="hidden" name="method" value={method} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" />
          {err("name") && <p className="text-xs text-burgundy">{err("name")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required autoComplete="tel" placeholder="012-345 6789" />
            {err("phone") && <p className="text-xs text-burgundy">{err("phone")}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email{method === "billplz" ? "" : " (optional)"}</Label>
            <Input id="email" name="email" type="email" required={method === "billplz"} autoComplete="email" />
            {err("email") && <p className="text-xs text-burgundy">{err("email")}</p>}
            {method === "billplz" && <p className="text-xs text-taupe">Your payment receipt is sent here.</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryAddress">Delivery address</Label>
          <Textarea id="deliveryAddress" name="deliveryAddress" rows={3} required placeholder="Unit, street, city, postcode" />
          {err("deliveryAddress") && <p className="text-xs text-burgundy">{err("deliveryAddress")}</p>}
        </div>

        <div className="flex flex-col gap-3 border-y border-taupe/15 py-6">
          <span className="text-xs uppercase tracking-label text-taupe">Please select your preferred date / time</span>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliveryDate">Delivery date</Label>
              <Input id="deliveryDate" name="deliveryDate" type="date" min={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliveryTimeSlot">Preferred time</Label>
              <select id="deliveryTimeSlot" name="deliveryTimeSlot" className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
                <option value="">No preference</option>
                {DELIVERY_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cardMessage">Message on the card (optional)</Label>
          <Textarea id="cardMessage" name="cardMessage" rows={2} maxLength={300} placeholder="What should the gift card say?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryNotes">Delivery notes (optional)</Label>
          <Textarea id="deliveryNotes" name="deliveryNotes" rows={2} placeholder="Recipient name, gate code, landmark…" />
        </div>

        {availableMethods.length > 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-label text-taupe">Payment method</span>
            <div className="flex flex-wrap gap-2">
              {availableMethods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`focus-ring border px-4 py-2 text-xs uppercase tracking-label ${
                    method === m ? "border-burgundy bg-burgundy text-ivory" : "border-taupe/40 text-soft-black hover:border-burgundy"
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
        )}

        {qrImage && (
          <div className="flex flex-col items-center gap-3 border border-taupe/20 bg-ivory p-6 text-center">
            <p className="text-sm text-soft-black">Scan to pay {formatPriceMYR(subtotal)} with {METHOD_LABELS[method]}</p>
            <div className="relative aspect-square w-48 overflow-hidden bg-white">
              <Image src={qrImage} alt={`${METHOD_LABELS[method]} QR code`} fill sizes="192px" className="object-contain" />
            </div>
            <p className="text-xs text-taupe">After scanning and paying, submit this order — we&rsquo;ll confirm once we see your payment.</p>
          </div>
        )}
        {method === "bank_transfer" && manualMethods.bank_transfer && (
          <div className="flex flex-col gap-2 border border-taupe/20 bg-ivory p-6">
            <p className="text-sm text-soft-black">Transfer {formatPriceMYR(subtotal)} to:</p>
            <p className="whitespace-pre-line text-sm text-taupe">{manualMethods.bank_transfer}</p>
            <p className="text-xs text-taupe">After transferring, submit this order — we&rsquo;ll confirm once we see your payment.</p>
          </div>
        )}

        {!state.success && state.message && (
          <p className="border border-burgundy/30 bg-burgundy/5 p-4 text-sm text-burgundy">{state.message}</p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending
            ? isManual
              ? "PLACING ORDER…"
              : "REDIRECTING TO PAYMENT…"
            : isManual
              ? `I'VE PAID — SUBMIT ORDER (${formatPriceMYR(subtotal)})`
              : `PAY ${formatPriceMYR(subtotal)} NOW`}
        </Button>
        {!isManual && (
          <p className="text-center text-xs text-taupe">
            You&rsquo;ll be redirected to Billplz&rsquo;s secure payment page to complete your payment via FPX, card or e-wallet.
          </p>
        )}

        <div className="flex items-center gap-3 text-xs uppercase tracking-label text-taupe">
          <span className="h-px flex-1 bg-taupe/20" /> or <span className="h-px flex-1 bg-taupe/20" />
        </div>
        <WhatsAppButton phoneNumber={whatsappNumber} message={whatsappMessage} label="ORDER VIA WHATSAPP INSTEAD" className="w-full" />
      </form>

      <aside className="flex flex-col gap-4 border border-taupe/15 bg-white p-6">
        <h2 className="font-serif-display text-lg">Your order</h2>
        <ul className="flex flex-col divide-y divide-taupe/15">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-3 py-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-ivory">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 text-sm">
                <span className="text-soft-black">{item.name}</span>
                {item.variant && <span className="text-xs text-taupe">{item.variant}</span>}
                <span className="text-xs text-taupe">
                  {item.quantity} × {formatPriceMYR(item.price)}
                </span>
              </div>
              <span className="text-sm text-soft-black">{formatPriceMYR(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-taupe/20 pt-4 text-sm font-medium">
          <span>Subtotal</span>
          <span>{formatPriceMYR(subtotal)}</span>
        </div>
        <p className="text-xs text-taupe">Delivery charges, if any, will be confirmed separately — see our Delivery page.</p>
      </aside>
    </div>
  );
}
