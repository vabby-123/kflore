import { formatPriceMYR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  from = false,
  className,
}: {
  price: string | number;
  compareAtPrice?: string | number | null;
  /** Prefixes "From " — use when the product's variants span a price range. */
  from?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="text-sm font-medium text-soft-black">
        {from && <span className="mr-1 text-xs font-normal uppercase tracking-label text-taupe">From</span>}
        {formatPriceMYR(price)}
      </span>
      {compareAtPrice && (
        <span className="text-xs text-taupe line-through">{formatPriceMYR(compareAtPrice)}</span>
      )}
    </span>
  );
}
