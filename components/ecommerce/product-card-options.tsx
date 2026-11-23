"use client";

import * as React from "react";
import { Price } from "./price";
import { buildProductOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn, formatPriceMYR } from "@/lib/utils";

export interface SizeOption {
  name: string;
  price: string;
}

/**
 * The price / size picker / WhatsApp link block of a product card. Picking a size shows that
 * size's price and puts the size + price into the WhatsApp order message; click it again to clear.
 * Everything else in the card stays a server component.
 */
export function ProductCardOptions({
  productName,
  price,
  priceFrom,
  compareAtPrice,
  sizeOptions,
  whatsappNumber,
  soldOut,
}: {
  productName: string;
  price: string;
  priceFrom?: string | null;
  compareAtPrice?: string | null;
  sizeOptions: SizeOption[];
  whatsappNumber: string;
  soldOut: boolean;
}) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const chosen = sizeOptions.find((s) => s.name === selected) ?? null;

  const shownPrice = chosen ? chosen.price : (priceFrom ?? price);
  const showFrom = !chosen && Boolean(priceFrom);

  const href = buildWhatsAppUrl(
    whatsappNumber,
    buildProductOrderMessage({
      productName,
      variant: chosen?.name ?? null,
      quantity: 1,
      price: formatPriceMYR(chosen ? chosen.price : price),
    })
  );

  return (
    <>
      <Price price={shownPrice} compareAtPrice={chosen || priceFrom ? null : compareAtPrice} from={showFrom} />

      {sizeOptions.length > 0 && (
        <div role="radiogroup" aria-label={`Choose a size for ${productName}`} className="flex flex-wrap gap-1.5">
          {sizeOptions.map((s) => {
            const active = s.name === selected;
            return (
              <button
                key={s.name}
                type="button"
                role="radio"
                aria-checked={active}
                title={`${s.name} · ${formatPriceMYR(s.price)}`}
                onClick={() => setSelected(active ? null : s.name)}
                className={cn(
                  "focus-ring min-w-8 border px-2 py-1 text-center text-[10px] font-medium uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "border-burgundy bg-burgundy text-ivory"
                    : "border-taupe/40 text-taupe hover:border-burgundy hover:text-burgundy"
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}
      {sizeOptions.length > 0 && (
        <p className="min-h-4 text-[11px] text-taupe" aria-live="polite">
          {chosen ? `Size ${chosen.name}: ${formatPriceMYR(chosen.price)}` : "Select a size to see its price"}
        </p>
      )}

      {!soldOut && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-1 w-fit text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy underline-offset-4 hover:underline"
        >
          Order via WhatsApp
        </a>
      )}
    </>
  );
}
