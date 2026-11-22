import { ProductCard } from "@/components/ecommerce/product-card";
import type { ProductCardDTO } from "@/types/catalogue";

/** 2 columns on phones, 3 on tablets, max 4 on desktop; capped width so 1920px screens stay elegant. */
export function ProductGrid({
  products,
  whatsappNumber,
  columns = 4,
  priorityCount = 0,
}: {
  products: ProductCardDTO[];
  whatsappNumber: string;
  columns?: 3 | 4;
  /** Number of leading cards whose image should be preloaded (above-the-fold rows only). */
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-serif-display text-xl text-soft-black">No flowers found</p>
        <p className="text-sm text-taupe">Please check back soon, or explore another collection.</p>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto grid w-full max-w-[1320px] grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-14 ${
        columns === 4 ? "xl:grid-cols-4" : ""
      }`}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} whatsappNumber={whatsappNumber} priority={i < priorityCount} />
      ))}
    </div>
  );
}
