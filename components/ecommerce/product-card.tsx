import Link from "next/link";
import Image from "next/image";
import { ProductCardOptions } from "./product-card-options";
import { cn, formatPriceMYR } from "@/lib/utils";
import type { ProductCardDTO } from "@/types/catalogue";

const DEFAULT_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw";

/**
 * Image-first product card. Server component: the hover image swap is pure CSS (`group-hover`),
 * so there is no per-card client state or hydration cost. The image box reserves a fixed 4:5
 * ratio, which keeps layout stable while photos load.
 */
export function ProductCard({
  product,
  whatsappNumber,
  className,
  sizes = DEFAULT_SIZES,
  priority = false,
}: {
  product: ProductCardDTO;
  whatsappNumber: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [primary, secondary] = product.images;
  const soldOut = product.stockStatus === "OUT_OF_STOCK";
  const onSale = Boolean(product.compareAtPrice);
  const badge = soldOut ? "Sold out" : onSale ? "Sale" : null;

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="focus-ring relative block aspect-[4/5] overflow-hidden bg-[#ece4d8]"
        aria-label={`${product.name}, ${formatPriceMYR(product.price)}`}
      >
        {primary && (
          <Image
            src={primary.url}
            alt={primary.altText || product.name}
            fill
            sizes={sizes}
            preload={priority}
            className={cn(
              "object-cover transition-[opacity,transform] duration-500 ease-out",
              secondary && "group-hover:opacity-0",
              !secondary && "group-hover:scale-[1.03]"
            )}
          />
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 bg-ivory/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-burgundy">
            {badge}
          </span>
        )}
      </Link>

      <div className="mt-4 flex flex-col gap-1.5">
        {product.category && (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-taupe">{product.category.name}</span>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="focus-ring font-serif-display text-xl leading-snug text-soft-black transition-colors hover:text-burgundy"
        >
          {product.name}
        </Link>
        <ProductCardOptions
          productName={product.name}
          price={product.price}
          priceFrom={product.priceFrom}
          compareAtPrice={product.compareAtPrice}
          sizeOptions={product.sizeOptions ?? []}
          whatsappNumber={whatsappNumber}
          soldOut={soldOut}
        />
      </div>
    </article>
  );
}
