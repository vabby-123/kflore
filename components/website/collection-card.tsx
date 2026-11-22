import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Image-led collection tile. Hover: image 1.00→1.04 over 600ms, subtle overlay darkening, CTA slides in.
 * On touch / small screens the tagline and CTA are always visible (nothing depends on hover).
 * The tile's box is sized by its parent (aspect-ratio or grid height), so nothing shifts on load.
 */
export function CollectionCard({
  name,
  slug,
  tagline,
  image,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  headingLevel = 3,
  priority = false,
}: {
  name: string;
  slug: string;
  tagline?: string | null;
  image?: string | null;
  className?: string;
  sizes?: string;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      href={`/collections/${slug}`}
      className={cn("focus-ring group relative isolate flex flex-col justify-end overflow-hidden bg-burgundy", className)}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes}
          preload={priority}
          className="-z-10 object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-burgundy via-burgundy-light to-taupe" aria-hidden="true" />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-soft-black/85 via-soft-black/35 to-soft-black/5 transition-opacity duration-[600ms] group-hover:from-soft-black/90"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-2 p-5 sm:p-7 lg:p-9">
        <Heading className="font-serif-display text-2xl leading-tight text-ivory sm:text-3xl lg:text-[2.1rem]">{name}</Heading>
        {tagline && <p className="max-w-xs text-sm leading-relaxed text-ivory/85">{tagline}</p>}
        <span className="tile-cta mt-1 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
          Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
