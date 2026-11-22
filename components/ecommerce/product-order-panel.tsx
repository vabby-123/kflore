"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Price } from "@/components/ecommerce/price";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart/cart-context";
import { buildProductOrderMessage } from "@/lib/whatsapp";
import { formatPriceMYR } from "@/lib/utils";
import { toast } from "sonner";
import type { ProductVariantDTO } from "@/types/catalogue";

const STOCK_LABELS: Record<string, { label: string; variant: "gold" | "muted" | "burgundy" }> = {
  IN_STOCK: { label: "In Stock", variant: "gold" },
  LOW_STOCK: { label: "Low Stock", variant: "burgundy" },
  OUT_OF_STOCK: { label: "Sold Out", variant: "muted" },
  MADE_TO_ORDER: { label: "Made to Order", variant: "gold" },
};

export function ProductOrderPanel({
  productId,
  slug,
  name,
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
  price: string;
  compareAtPrice?: string | null;
  stockStatus: string;
  variants: ProductVariantDTO[];
  deliveryEligible: boolean;
  whatsappNumber: string;
  imageUrl?: string;
}) {
  // Default to the cheapest option, and only drop the "From" price label once the shopper has
  // actually picked a size — otherwise "From RM X" would silently become a specific, possibly
  // higher, price with no indication anything changed.
  const cheapestVariant = useMemo(() => {
    if (variants.length === 0) return undefined;
    return variants.reduce((min, v) => {
      const vPrice = v.price ? parseFloat(v.price) : parseFloat(price);
      const minPrice = min.price ? parseFloat(min.price) : parseFloat(price);
      return vPrice < minPrice ? v : min;
    }, variants[0]).name;
  }, [variants, price]);

  const [variant, setVariant] = useState<string | undefined>(cheapestVariant);
  const [variantTouched, setVariantTouched] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  const effectivePrice = useMemo(() => {
    const selected = variants.find((v) => v.name === variant);
    return selected?.price ? parseFloat(selected.price) : parseFloat(price);
  }, [variant, variants, price]);

  const priceVaries = variants.length > 0 && variants.some((v) => (v.price ? parseFloat(v.price) : parseFloat(price)) !== effectivePrice);
  const showFrom = priceVaries && !variantTouched;

  const outOfStock = stockStatus === "OUT_OF_STOCK";
  const stockInfo = STOCK_LABELS[stockStatus] ?? STOCK_LABELS.IN_STOCK;

  const message = buildProductOrderMessage({
    productName: name,
    variant,
    quantity,
    price: `RM ${effectivePrice.toFixed(2)}`,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
        {deliveryEligible && <Badge variant="muted">Same-Day Delivery Eligible</Badge>}
      </div>

      <h1 className="font-serif-display text-3xl text-soft-black md:text-4xl">{name}</h1>
      <Price price={effectivePrice} compareAtPrice={showFrom ? undefined : compareAtPrice} from={showFrom} className="text-lg" />

      {variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-label text-taupe">Size / Option</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVariant(v.name);
                  setVariantTouched(true);
                }}
                className={`focus-ring border px-4 py-2 text-xs uppercase tracking-label ${
                  variant === v.name ? "border-burgundy bg-burgundy text-ivory" : "border-taupe/40 text-soft-black hover:border-burgundy"
                }`}
              >
                {v.name}
                {v.price && <span className="ml-1.5 opacity-70">{formatPriceMYR(v.price)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-label text-taupe">Quantity</span>
        <div className="inline-flex w-fit items-center border border-taupe/40">
          <button
            className="focus-ring flex h-11 w-11 items-center justify-center text-soft-black hover:text-burgundy"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            className="focus-ring flex h-11 w-11 items-center justify-center text-soft-black hover:text-burgundy"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {outOfStock ? (
        <p className="text-sm text-taupe">
          This arrangement is currently sold out. Please enquire on WhatsApp for restock timing or a similar alternative.
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => {
              addItem({
                productId,
                slug,
                name,
                image: imageUrl,
                variant,
                price: effectivePrice,
                quantity,
              });
              toast.success(`${name} added to cart`);
              openCart();
            }}
          >
            ADD TO CART
          </Button>
          <WhatsAppButton phoneNumber={whatsappNumber} message={message} size="lg" className="flex-1" />
        </div>
      )}
      {outOfStock && (
        <WhatsAppButton
          phoneNumber={whatsappNumber}
          message={`Hi KFLORÉ, I'd like to enquire about restock availability for ${name}.`}
          label="ENQUIRE ON WHATSAPP"
          size="lg"
        />
      )}
    </div>
  );
}
