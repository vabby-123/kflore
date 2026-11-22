import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero({
  headingLine1,
  headingLine2,
  subtitle,
  image,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: {
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  image?: string | null;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}) {
  return (
    <section className="relative flex h-[92vh] min-h-[640px] w-full items-end overflow-hidden bg-soft-black">
      {image && (
        <Image
          src={image}
          alt="KFLORÉ luxury floral arrangement"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-soft-black/30 to-soft-black/10" />

      <div className="container-kflore relative z-10 flex flex-col gap-6 pb-20 md:pb-24">
        <h1 className="animate-fade-up font-serif-display text-5xl leading-[1.05] text-ivory md:text-7xl">
          {headingLine1}
          <br />
          {headingLine2}
        </h1>
        <p className="animate-fade-up max-w-md text-sm leading-relaxed text-ivory/85 md:text-base [animation-delay:150ms]">
          {subtitle}
        </p>
        <div className="animate-fade-up flex flex-wrap gap-4 [animation-delay:300ms]">
          <Button asChild size="lg">
            <Link href={ctaPrimaryHref}>{ctaPrimaryLabel}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="border-ivory text-ivory hover:bg-ivory hover:text-burgundy">
            <Link href={ctaSecondaryHref}>{ctaSecondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
