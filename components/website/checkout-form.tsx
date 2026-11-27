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
import { availableTimeSlots, shopToday, type PaymentMethod } from "@/lib/validations/checkout";
import { CardMessageField } from "@/components/ecommerce/card-message-field";
import { PaymentMethodList } from "@/components/website/payment-method-list";
import type { ManualMethods } from "@/lib/payments";
import { buildCartOrderMessage, formatDeliveryDate } from "@/lib/whatsapp";
import { evaluateDiscount } from "@/lib/rewards";
import { formatPriceMYR } from "@/lib/utils";

const initialState: CheckoutState = { success: false };

export function CheckoutForm({
  whatsappNumber,
  billplzEnabled,
  manualMethods,
}: {
  whatsappNumber: string;
  billplzEnabled: boolean;
  manualMethods: ManualMethods;
}) {
  const { items, subtotal, clearCart, delivery, setDelivery } = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createCheckout, initialState);

  // Every manual method is always offered. If a QR / bank detail hasn't been saved in the admin yet,
  // checkout tells the customer we'll WhatsApp them the details right after the order is placed.
  const availableMethods = useMemo<PaymentMethod[]>(
    () => [...(billplzEnabled ? (["billplz"] as const) : []), "duitnow_qr", "tng_qr", "maybank_qr", "bank_transfer"],
    [billplzEnabled]
  );

  const [method, setMethod] = useState<PaymentMethod | undefined>(availableMethods[0]);

  const itemsJson = useMemo(
    () => JSON.stringify(items.map((i) => ({ productId: i.productId, variant: i.variant ?? null, quantity: i.quantity }))),
    [items]
  );
  const discount = evaluateDiscount(delivery.discountCode, subtotal);
  const payable = subtotal - (discount.valid ? discount.amount : 0);
  const whatsappMessage = buildCartOrderMessage({
    items: items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, price: i.price })),
    subtotal,
    deliveryLocation: delivery.location,
    deliveryDate: delivery.date,
    timeSlot: delivery.timeSlot,
    cardMessage: delivery.cardMessage,
    discountCode: discount.valid ? discount.code : undefined,
    discountAmount: discount.valid ? discount.amount : undefined,
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
        <input type="hidden" name="discountCode" value={delivery.discountCode} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Your name (sender)</Label>
          <Input id="name" name="name" required autoComplete="name" />
          {err("name") && <p className="text-xs text-burgundy">{err("name")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Your phone</Label>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recipientName">Recipient name (optional)</Label>
            <Input id="recipientName" name="recipientName" maxLength={120} placeholder="Who is receiving the flowers?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recipientPhone">Recipient phone (optional)</Label>
            <Input id="recipientPhone" name="recipientPhone" maxLength={30} placeholder="For the delivery rider" />
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm text-soft-black">
          <input type="checkbox" name="anonymous" className="h-4 w-4 accent-[#5a1725]" />
          Surprise delivery: don&rsquo;t tell the recipient my name
        </label>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryAddress">Delivery address</Label>
          <Textarea id="deliveryAddress" name="deliveryAddress" rows={3} required placeholder="Unit, street, city, postcode" defaultValue={delivery.location} />
          {err("deliveryAddress") && <p className="text-xs text-burgundy">{err("deliveryAddress")}</p>}
        </div>

        <div className="flex flex-col gap-3 border-y border-taupe/15 py-6">
          <span className="text-xs uppercase tracking-label text-taupe">Please select your preferred date / time</span>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliveryDate">Delivery date</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                required
                value={delivery.date}
                onChange={(e) => setDelivery({ date: e.target.value })}
                min={shopToday()}
              />
              {delivery.date ? (
                <p className="text-xs text-taupe">Delivery day: <span className="font-medium text-soft-black">{formatDeliveryDate(delivery.date)}</span></p>
              ) : (
                <p className="text-xs font-medium text-red-700">Please select a date to continue checkout.</p>
              )}
              {err("deliveryDate") && <p className="text-xs text-burgundy">{err("deliveryDate")}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliveryTimeSlot">Preferred time</Label>
              <select
                id="deliveryTimeSlot"
                name="deliveryTimeSlot"
                value={delivery.timeSlot}
                onChange={(e) => setDelivery({ timeSlot: e.target.value })}
                className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
                <option value="">No preference</option>
                {availableTimeSlots(delivery.date).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <CardMessageField name="cardMessage" value={delivery.cardMessage} onChange={(cardMessage) => setDelivery({ cardMessage })} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discountCodeInput">Discount code (optional)</Label>
          <Input
            id="discountCodeInput"
            value={delivery.discountCode}
            onChange={(e) => setDelivery({ discountCode: e.target.value.toUpperCase() })}
            placeholder="e.g. WELCOME10"
            className="uppercase"
          />
          {delivery.discountCode.trim() && (
            <p className={`text-xs ${discount.valid ? "text-green-700" : "text-red-700"}`}>
              {discount.valid ? `${discount.message} You save ${formatPriceMYR(discount.amount)}. Your email is required to use this code.` : discount.message}
            </p>
          )}
          {err("discountCode") && <p className="text-xs text-burgundy">{err("discountCode")}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deliveryNotes">Delivery notes (optional)</Label>
          <Textarea id="deliveryNotes" name="deliveryNotes" rows={2} placeholder="Gate code, landmark, where to leave it…" />
        </div>

        <PaymentMethodList methods={availableMethods} selected={method} onSelect={setMethod} amount={payable} manualMethods={manualMethods} />

        {!state.success && state.message && (
          <p className="border border-burgundy/30 bg-burgundy/5 p-4 text-sm text-burgundy">{state.message}</p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="w-full bg-green-700 text-white hover:bg-green-800">
          {pending
            ? isManual
              ? "PLACING ORDER…"
              : "REDIRECTING TO PAYMENT…"
            : isManual
              ? `SUBMIT ORDER (${formatPriceMYR(payable)})`
              : `PAY ${formatPriceMYR(payable)} NOW`}
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
        {discount.valid && (
          <>
            <div className="flex items-center justify-between text-sm text-green-700">
              <span>Discount ({discount.code})</span>
              <span>-{formatPriceMYR(discount.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatPriceMYR(payable)}</span>
            </div>
          </>
        )}
        <p className="text-xs text-taupe">Delivery charges, if any, will be confirmed separately — see our Delivery page.</p>
      </aside>
    </div>
  );
}
