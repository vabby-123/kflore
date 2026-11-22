import Link from "next/link";
import { getImageProps } from "next/image";
import { HeroCarouselClient, type HeroSlideView } from "@/components/website/hero-carousel-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { heroSlides } from "@/lib/db/schema";

type Slide = typeof heroSlides.$inferSelect;

const POSITION_CLASS: Record<string, string> = {
  left: "items-start text-left",
  center: "items-center text-center mx-auto",
  right: "items-end text-right ml-auto",
};

export function SlideMedia({ slide, first }: { slide: Pick<Slide, "image" | "mobileImage" | "objectPosition" | "title">; first: boolean }) {
  // Art-directed <picture>: an independent mobile crop is only downloaded on small screens.
  const desktop = getImageProps({
    src: slide.image,
    alt: "",
    fill: true,
    sizes: "100vw",
    quality: 72,
    preload: first,
    unoptimized: slide.image.endsWith(".svg"),
    loading: first ? "eager" : "lazy",
  });
  const mobile = slide.mobileImage
    ? getImageProps({ src: slide.mobileImage, alt: "", fill: true, sizes: "100vw", quality: 72, unoptimized: slide.mobileImage.endsWith(".svg") })
    : null;

  const style = { ...desktop.props.style, objectFit: "cover" as const, objectPosition: slide.objectPosition };

  return (
    <picture className="absolute inset-0 block">
      {mobile?.props.srcSet && <source media="(max-width: 767px)" srcSet={mobile.props.srcSet} sizes="100vw" />}
      <img {...desktop.props} alt="" style={style} />
    </picture>
  );
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return <HeroFallback />;

  const views: HeroSlideView[] = slides.map((s, i) => ({
    id: s.id,
    label: s.title,
    media: <SlideMedia slide={s} first={i === 0} />,
    overlay: s.overlayOpacity,
    content: (
      <div className={cn("flex max-w-xl flex-col gap-5 md:gap-6", POSITION_CLASS[s.textPosition] ?? POSITION_CLASS.left)}>
        {s.eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ivory/90">{s.eyebrow}</p>
        )}
        {i === 0 ? (
          <h1 className="font-serif-display text-[2.6rem] leading-[1.04] text-ivory sm:text-6xl lg:text-7xl">{s.title}</h1>
        ) : (
          <h2 className="font-serif-display text-[2.6rem] leading-[1.04] text-ivory sm:text-6xl lg:text-7xl">{s.title}</h2>
        )}
        {s.subtitle && <p className="max-w-md text-sm leading-relaxed text-ivory/85 md:text-base">{s.subtitle}</p>}
        {(s.primaryCtaLabel || s.secondaryCtaLabel) && (
          <div className="mt-2 flex flex-wrap gap-3">
            {s.primaryCtaLabel && s.primaryCtaHref && (
              <Link href={s.primaryCtaHref} className={buttonVariants({ size: "lg" })}>
                {s.primaryCtaLabel}
              </Link>
            )}
            {s.secondaryCtaLabel && s.secondaryCtaHref && (
              <Link
                href={s.secondaryCtaHref}
                className={buttonVariants({ variant: "secondary", size: "lg", className: "border-ivory text-ivory hover:bg-ivory hover:text-burgundy" })}
              >
                {s.secondaryCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    ),
  }));

  return <HeroCarouselClient slides={views} />;
}

/** Shown only until the first slide is created in the admin. */
function HeroFallback() {
  return (
    <section className="hero-pull relative flex min-h-[70svh] items-end bg-burgundy text-ivory md:min-h-[80svh]">
      <div className="container-kflore pb-20">
        <h1 className="font-serif-display text-5xl leading-[1.05] md:text-7xl">Flowers, thoughtfully arranged.</h1>
      </div>
    </section>
  );
}
