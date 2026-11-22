import Link from "next/link";
import { CollectionCard } from "@/components/website/collection-card";

interface MosaicCollection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image: string | null;
}

// Column spans per tile on desktop: rows alternate large|medium and medium|large.
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-7", "lg:col-span-5"];

/**
 * Editorial, deliberately asymmetric collection lookbook.
 * Desktop: 12-col grid, rows alternate 7/5 and 5/7 at a fixed row height.
 * Mobile: 2-col grid (first tile full width) with tall portrait tiles, never tiny thumbnails.
 */
export function CollectionMosaic({ collections }: { collections: MosaicCollection[] }) {
  if (collections.length === 0) return null;
  const tiles = collections.slice(0, 6);

  return (
    <section aria-labelledby="collections-heading" className="section-lg">
      <div className="container-kflore">
        <div className="section-header mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-burgundy">Explore collections</p>
          <h2 id="collections-heading" className="font-serif-display text-4xl leading-[1.1] md:text-5xl">
            Arrangements for every story
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-6">
          {tiles.map((c, i) => (
            <CollectionCard
              key={c.id}
              name={c.name}
              slug={c.slug}
              tagline={c.tagline || c.description}
              image={c.image}
              sizes={i % 4 < 2 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 50vw"}
              className={`${i === 0 || (i === tiles.length - 1 && tiles.length % 2 === 0) ? "col-span-2 aspect-[4/3] sm:aspect-[16/10]" : "aspect-[3/4] sm:aspect-[4/5]"} ${SPANS[i]} lg:aspect-auto lg:h-[clamp(26rem,36vw,34rem)]`}
            />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/collections"
            className="focus-ring border-b border-burgundy pb-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy transition-colors hover:text-burgundy-light"
          >
            View all collections
          </Link>
        </div>
      </div>
    </section>
  );
}

