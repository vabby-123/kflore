import Link from "next/link";
import Image from "next/image";
import { Price } from "./price";
import { buildProductOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
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
        <Price price={product.priceFrom ?? product.price} compareAtPrice={product.priceFrom ? null : product.compareAtPrice} from={Boolean(product.priceFrom)} />
        {product.sizes && product.sizes.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Available sizes">
            {product.sizes.map((s) => (
              <li key={s} className="min-w-7 border border-taupe/40 px-1.5 py-0.5 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-taupe">
                {s}
              </li>
            ))}
          </ul>
        )}
        {!soldOut && (
          <a
            href={buildWhatsAppUrl(
              whatsappNumber,
              buildProductOrderMessage({ productName: product.name, quantity: 1, price: formatPriceMYR(product.price) })
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-1 w-fit text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy underline-offset-4 hover:underline"
          >
            Order via WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
