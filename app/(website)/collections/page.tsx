import { CollectionCard } from "@/components/website/collection-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedCollections } from "@/lib/db/queries";
import { groupCollectionsByType } from "@/lib/collections";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Collections",
  description: "Browse KFLORÉ's curated floral collections by occasion, type, style and flower.",
  path: "/collections",
});

export default async function CollectionsPage() {
  const collectionsList = await getPublishedCollections();
  const groups = groupCollectionsByType(collectionsList);

  return (
    <div className="container-kflore page-section flex flex-col gap-20">
      <SectionHeading eyebrow="KFLORÉ COLLECTIONS" title="Arrangements for every story" className="mx-auto" />

      {groups.map((g) => (
        <section key={g.type} aria-labelledby={`group-${g.type}`} className="mx-auto w-full max-w-[1320px]">
          <h2 id={`group-${g.type}`} className="mb-8 border-b border-taupe/25 pb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-burgundy">
            {g.label}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
            {g.items.map((c) => {
              const full = collectionsList.find((x) => x.slug === c.slug)!;
              return (
                <CollectionCard
                  key={c.slug}
                  name={c.name}
                  slug={c.slug}
                  tagline={full.tagline || full.description}
                  image={full.image}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 50vw"
                  className="aspect-[3/4] sm:aspect-[4/5]"
                />
              );
            })}
          </div>
        </section>
      ))}

      {collectionsList.length === 0 && (
        <p className="text-center text-sm text-taupe">Collections will appear here once added from the admin panel.</p>
      )}
    </div>
  );
}
