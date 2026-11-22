import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

/** Spacious editorial brand-story block: large portrait image beside a serif headline. */
export function AboutTeaser({
  heading,
  excerpt,
  image,
}: {
  heading: string;
  excerpt?: string | null;
  image?: string | null;
}) {
  return (
    <section aria-labelledby="story-heading" className="section-lg">
      <div className="container-kflore">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e6dccd] lg:col-span-6">
            {image && (
              <Image
                src={image}
                alt="KFLORÉ florist arranging flowers"
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col items-start gap-7 lg:col-span-5 lg:col-start-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-burgundy">Our story</p>
            <h2 id="story-heading" className="font-serif-display whitespace-pre-line text-4xl leading-[1.1] md:text-5xl">
              {heading}
            </h2>
            {excerpt && <p className="prose-editorial text-base leading-relaxed text-taupe md:text-lg">{excerpt}</p>}
            <Link href="/about" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
