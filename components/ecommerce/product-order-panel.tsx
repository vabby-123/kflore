"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flower2, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Price } from "@/components/ecommerce/price";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart/cart-context";
import { buildProductOrderMessage, formatDeliveryDate } from "@/lib/whatsapp";
import { DELIVERY_TIME_SLOTS } from "@/lib/validations/checkout";
import { cn, formatPriceMYR } from "@/lib/utils";
import { toast } from "sonner";
import type { ProductVariantDTO } from "@/types/catalogue";

const STOCK_LABELS: Record<string, { label: string; variant: "gold" | "muted" | "burgundy" }> = {
  IN_STOCK: { label: "In Stock", variant: "gold" },
  LOW_STOCK: { label: "Low Stock", variant: "burgundy" },
  OUT_OF_STOCK: { label: "Sold Out", variant: "muted" },
  MADE_TO_ORDER: { label: "Made to Order", variant: "gold" },
};

const SIZE_NOTES: Record<string, string> = {
  REGULAR: "Our classic size",
  M: "Fuller",
  L: "Generous",
  XL: "Grand statement",
};

const MESSAGE_LIMIT = 300;

const fieldClass = "focus-ring w-full border border-taupe/40 bg-white px-3 text-sm text-soft-black";

/** yyyy-mm-dd in the visitor's own time zone (toISOString would shift the day for UTC+8). */
function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-label text-soft-black">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-[10px] text-ivory">{n}</span>
      {children}
    </span>
  );
}

export function ProductOrderPanel({
  productId,
  slug,
  name,
  shortDescription,
  price,
  compareAtPrice,
  stockStatus,
  variants,
  deliveryEligible,
  whatsappNumber,
  imageUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  price: string;
  compareAtPrice?: string | null;
  stockStatus: string;
  variants: ProductVariantDTO[];
  deliveryEligible: boolean;
  whatsappNumber: string;
  imageUrl?: string;
}) {
  const router = useRouter();
  const priceOf = (v: ProductVariantDTO) => (v.price ? parseFloat(v.price) : parseFloat(price));
  // Cheapest first, so sizes always read Regular -> XL.
  const sortedVariants = useMemo(
    () => [...variants].sort((a, b) => parseFloat(a.price ?? price) - parseFloat(b.price ?? price)),
    [variants, price]
  );

  const [variant, setVariant] = useState<string | undefined>(sortedVariants[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [dateMissing, setDateMissing] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const { addItem, openCart, closeCart, delivery, setDelivery } = useCart();

  const selected = variants.find((v) => v.name === variant);
  const unitPrice = selected ? priceOf(selected) : parseFloat(price);
  const total = unitPrice * quantity;

  const outOfStock = stockStatus === "OUT_OF_STOCK";
  const stockInfo = STOCK_LABELS[stockStatus] ?? STOCK_LABELS.IN_STOCK;
  const today = localDate();
  const tomorrow = localDate(1);

  const message = buildProductOrderMessage({
    productName: name,
    variant,
    quantity,
    price: formatPriceMYR(total),
    deliveryDate: delivery.date,
    timeSlot: delivery.timeSlot,
    deliveryLocation: delivery.location,
    customerMessage: delivery.cardMessage,
  });

  const chooseDate = (date: string) => {
    setDelivery({ date });
    setDateMissing(false);
  };

  /** Every way of ordering needs a delivery date first. */
  const requireDate = () => {
    if (delivery.date) return true;
    setDateMissing(true);
    dateRef.current?.focus();
    dateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  const add = () =>
    addItem({ productId, slug, name, image: imageUrl, variant, price: unitPrice, quantity });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
          {deliveryEligible && <Badge variant="muted">Same-Day Delivery Eligible</Badge>}
        </div>
        <h1 className="font-serif-display text-3xl text-soft-black md:text-4xl">{name}</h1>
        {shortDescription && <p className="max-w-md text-sm leading-relaxed text-taupe">{shortDescription}</p>}
        <Price price={unitPrice} compareAtPrice={variant === sortedVariants[0]?.name ? compareAtPrice : undefined} className="text-lg" />
      </div>

      {sortedVariants.length > 0 && (
        <div className="flex flex-col gap-3">
          <StepTitle n={1}>Choose your size</StepTitle>
          <div role="radiogroup" aria-label="Size" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sortedVariants.map((v) => {
              const active = variant === v.name;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setVariant(v.name)}
                  className={cn(
                    "focus-ring flex flex-col items-center gap-0.5 border px-2 py-3 text-center transition-colors",
                    active ? "border-burgundy bg-burgundy text-ivory" : "border-taupe/40 bg-white text-soft-black hover:border-burgundy"
                  )}
                >
                  <span className="text-xs font-medium uppercase tracking-label">{v.name}</span>
                  <span className="text-sm">{formatPriceMYR(priceOf(v))}</span>
                  {SIZE_NOTES[v.name.toUpperCase()] && (
                    <span className={cn("text-[10px]", active ? "text-ivory/80" : "text-taupe")}>{SIZE_NOTES[v.name.toUpperCase()]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!outOfStock && (
        <>
          <div className="flex flex-col gap-3">
            <StepTitle n={2}>Delivery date &amp; time</StepTitle>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Today", value: today },
                { label: "Tomorrow", value: tomorrow },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  aria-pressed={delivery.date === d.value}
                  onClick={() => chooseDate(d.value)}
                  className={cn(
                    "focus-ring h-11 border px-5 text-xs uppercase tracking-label",
                    delivery.date === d.value ? "border-burgundy bg-burgundy text-ivory" : "border-taupe/40 bg-white hover:border-burgundy"
                  )}
                >
                  {d.label}
                </button>
              ))}
              <input
                ref={dateRef}
                type="date"
                aria-label="Delivery date"
                min={today}
                value={delivery.date}
                onChange={(e) => chooseDate(e.target.value)}
                className={cn(fieldClass, "h-11 min-w-40 flex-1", dateMissing && "border-red-700")}
              />
            </div>
            {delivery.date ? (
              <p className="text-xs text-taupe">
                Delivery on <span className="font-medium text-soft-black">{formatDeliveryDate(delivery.date)}</span>
              </p>
            ) : (
              <p className={cn("text-xs", dateMissing ? "font-medium text-red-700" : "text-taupe")} role={dateMissing ? "alert" : undefined}>
                Please select a delivery date to continue.
              </p>
            )}
            <select
              aria-label="Preferred delivery time"
              value={delivery.timeSlot}
              onChange={(e) => setDelivery({ timeSlot: e.target.value })}
              className={cn(fieldClass, "h-11")}
            >
              <option value="">Preferred time: no preference</option>
              {DELIVERY_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <input
              value={delivery.location}
              onChange={(e) => setDelivery({ location: e.target.value })}
              placeholder="Delivery area / address (KL & Klang Valley)"
              aria-label="Delivery location"
              className={cn(fieldClass, "h-11")}
            />
          </div>

          <div className="flex flex-col gap-3">
            <StepTitle n={3}>Message card (optional)</StepTitle>
            <textarea
              value={delivery.cardMessage}
              onChange={(e) => setDelivery({ cardMessage: e.target.value })}
              rows={3}
              maxLength={MESSAGE_LIMIT}
              placeholder="Write the words you'd like on the card…"
              aria-label="Message card"
              className={cn(fieldClass, "py-2")}
            />
            <span className="text-right text-[11px] text-taupe">
              {delivery.cardMessage.length}/{MESSAGE_LIMIT}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 border-y border-taupe/20 py-4">
            <div className="inline-flex items-center border border-taupe/40 bg-white">
              <button
                type="button"
                className="focus-ring flex h-11 w-11 items-center justify-center text-soft-black hover:text-burgundy"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                className="focus-ring flex h-11 w-11 items-center justify-center text-soft-black hover:text-burgundy"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-label text-taupe">Total</span>
              <span className="font-serif-display text-2xl text-burgundy [font-variant-numeric:lining-nums]">{formatPriceMYR(total)}</span>
            </div>
          </div>
        </>
      )}

      {outOfStock ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-taupe">
            This arrangement is currently sold out. Please enquire on WhatsApp for restock timing or a similar alternative.
          </p>
          <WhatsAppButton
            phoneNumber={whatsappNumber}
            message={`Hi KFLORÉ, I'd like to enquire about restock availability for ${name}.`}
            label="ENQUIRE ON WHATSAPP"
            size="lg"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                if (!requireDate()) return;
                add();
                toast.success(`${name} added to cart`);
                openCart();
              }}
            >
              ADD TO CART
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (!requireDate()) return;
                add();
                closeCart();
                router.push("/checkout");
              }}
            >
              BUY NOW
            </Button>
          </div>
          {delivery.date ? (
            <WhatsAppButton phoneNumber={whatsappNumber} message={message} size="lg" className="w-full" />
          ) : (
            <Button variant="whatsapp" size="lg" className="w-full" onClick={requireDate}>
              ORDER VIA WHATSAPP
            </Button>
          )}
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 text-center text-[11px] leading-snug text-taupe">
        <li className="flex flex-col items-center gap-1.5">
          <Flower2 className="h-5 w-5 text-gold" aria-hidden="true" />
          Hand-arranged fresh
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <Truck className="h-5 w-5 text-gold" aria-hidden="true" />
          Same-day in KL &amp; Klang Valley
        </li>
        <li className="flex flex-col items-center gap-1.5">
          <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" />
          QR, e-wallet &amp; bank transfer
        </li>
      </ul>
    </div>
  );
}
