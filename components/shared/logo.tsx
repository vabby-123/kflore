import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * KFLORÉ wordmark — set in the brand serif, not an image, so it stays crisp at any size and
 * recolors instantly with the header's transparent-over-hero → solid transition.
 */
export function Logo({
  className,
  light,
  inherit,
}: {
  className?: string;
  /** Ivory wordmark (for dark backgrounds, e.g. the footer). */
  light?: boolean;
  /** Follow the sticky header's colour state (transparent-over-hero vs solid). */
  inherit?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "focus-ring font-serif-display text-2xl tracking-[0.1em] lg:text-[1.65rem]",
        inherit ? "text-[color:var(--hdr-brand)]" : light ? "text-ivory" : "text-burgundy",
        className
      )}
      aria-label="KFLORÉ home"
    >
      KFLORÉ
    </Link>
  );
}
