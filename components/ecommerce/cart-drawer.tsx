"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { useCart } from "@/lib/cart/cart-context";
import { buildCartOrderMessage, formatDeliveryDate } from "@/lib/whatsapp";
import { evaluateDiscount } from "@/lib/rewards";
import { availableTimeSlots } from "@/lib/validations/checkout";
import { formatPriceMYR } from "@/lib/utils";
import { CardMessageField } from "./card-message-field";
import { PaymentBadge } from "./payment-badge";

const CART_PROMISES = [
  "Fresh flowers, hand-arranged on the day of delivery",
  "Your message card included with the order",
  "Same-day orders: afternoon or evening delivery",
];

export function CartDrawer({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart, delivery, setDelivery } = useCart();
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const hasDate = Boolean(delivery.date);
  const discount = evaluateDiscount(delivery.discountCode, subtotal);

  const message = buildCartOrderMessage({
    items: items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, price: i.price })),
    subtotal,
    deliveryLocation: delivery.location,
    deliveryDate: delivery.date,
    timeSlot: delivery.timeSlot,
    cardMessage: delivery.cardMessage,
    discountCode: discount.valid ? discount.code : undefined,
    discountAmount: discount.valid ? discount.amount : undefined,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent title="Your cart">
        <div className="flex items-center justify-between border-b border-taupe/20 px-6 py-5">
          <h2 className="font-serif-display text-xl text-soft-black">Your Cart</h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-taupe">Your cart is empty.</p>
            <Button variant="secondary" size="sm" onClick={closeCart} asChild>
              <Link href="/shop">CONTINUE SHOPPING</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white">
                      {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-medium text-soft-black">{item.name}</span>
                      {item.variant && <span className="text-xs text-taupe">Size: {item.variant}</span>}
                      <span className="text-xs text-soft-black">{formatPriceMYR(item.price)}</span>
                      <div className="mt-1 flex items-center gap-3">
                        <button
                          className="focus-ring text-taupe hover:text-burgundy"
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-xs">{item.quantity}</span>
                        <button
                          className="focus-ring text-taupe hover:text-burgundy"
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="focus-ring ml-auto text-taupe hover:text-burgundy"
                          onClick={() => removeItem(item.productId, item.variant)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <input
                  value={delivery.discountCode}
                  onChange={(e) => setDelivery({ discountCode: e.target.value.toUpperCase() })}
                  placeholder="Discount code (e.g. WELCOME10)"
                  className="focus-ring h-10 border border-taupe/40 bg-white px-3 text-sm uppercase"
                />
                {delivery.discountCode.trim() && (
                  <p className={`text-xs ${discount.valid ? "text-green-700" : "text-red-700"}`}>
                    {discount.valid ? `${discount.message} You save ${formatPriceMYR(discount.amount)}.` : discount.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 border border-taupe/20 p-4">
                <p className="text-xs font-medium uppercase tracking-label text-soft-black">Please select your preferred date for your order</p>
                <label className="flex items-center gap-3 text-sm text-soft-black">
                  <span className="shrink-0 text-taupe">Delivery date</span>
                  <input
                    type="date"
                    value={delivery.date}
                    min={minDate}
                    onChange={(e) => setDelivery({ date: e.target.value })}
                    className="focus-ring h-10 flex-1 border border-taupe/40 bg-white px-3 text-sm"
                  />
                </label>
                {hasDate ? (
                  <p className="text-xs text-taupe">Delivery day: <span className="font-medium text-soft-black">{formatDeliveryDate(delivery.date)}</span></p>
                ) : (
                  <p className="text-xs font-medium text-red-700" role="alert">Please select a date to continue checkout.</p>
                )}
                <select
                  aria-label="Preferred delivery time"
                  value={delivery.timeSlot}
                  onChange={(e) => setDelivery({ timeSlot: e.target.value })}
                  className="focus-ring h-10 border border-taupe/40 bg-white px-3 text-sm"
                >
                  <option value="">Preferred time: no preference</option>
                  {availableTimeSlots(delivery.date).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <input
                  value={delivery.location}
                  onChange={(e) => setDelivery({ location: e.target.value })}
                  placeholder="Delivery location (area / address)"
                  className="focus-ring h-10 border border-taupe/40 bg-white px-3 text-sm"
                />
                <CardMessageField value={delivery.cardMessage} onChange={(cardMessage) => setDelivery({ cardMessage })} />
              </div>
              <ul className="flex flex-col gap-2 text-xs text-soft-black">
                {CART_PROMISES.map((text) => (
                  <li key={text} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" strokeWidth={3} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="flex justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={closeCart} asChild>
                  <Link href="/shop">CONTINUE SHOPPING</Link>
                </Button>
                <Button variant="link" size="sm" onClick={clearCart}>
                  Clear cart
                </Button>
              </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-taupe/20 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-taupe">Subtotal</span>
                <span className="text-soft-black">{formatPriceMYR(subtotal)}</span>
              </div>
              {discount.valid && (
                <div className="flex items-center justify-between text-sm text-green-700">
                  <span>Discount ({discount.code})</span>
                  <span>-{formatPriceMYR(discount.amount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-medium text-soft-black">
                <span>Total</span>
                <span>{formatPriceMYR(subtotal - (discount.valid ? discount.amount : 0))}</span>
              </div>
              <p className="text-[11px] text-taupe">Delivery charges, if any, are confirmed separately.</p>
              {!hasDate && <p className="text-xs font-medium text-red-700">Choose a delivery date above to continue.</p>}
              {hasDate ? (
                <Button asChild size="lg" className="w-full bg-green-700 text-white hover:bg-green-800" onClick={closeCart}>
                  <Link href="/checkout">CHECKOUT &amp; PAY</Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  CHECKOUT &amp; PAY
                </Button>
              )}
              {hasDate ? (
                <WhatsAppButton phoneNumber={whatsappNumber} message={message} label="ORDER VIA WHATSAPP" className="w-full" variant="secondary" />
              ) : (
                <Button className="w-full" variant="secondary" disabled>
                  ORDER VIA WHATSAPP
                </Button>
              )}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="sr-only">We accept DuitNow QR, TNG eWallet, Maybank QRPay and bank transfer</span>
                {(["duitnow_qr", "tng_qr", "maybank_qr", "bank_transfer"] as const).map((m) => (
                  <PaymentBadge key={m} method={m} className="h-8 w-[4.25rem]" />
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
