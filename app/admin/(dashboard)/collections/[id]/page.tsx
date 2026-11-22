import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { updateCollection } from "@/lib/actions/collections";
import { getCustomCollectionTypes } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [collection] = await db.select().from(collections).where(eq(collections.id, id));
  if (!collection) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Collection</h1>
      <TaxonomyForm
        action={updateCollection.bind(null, id)}
        backHref="/admin/collections"
        initial={collection}
        withCollectionFields
        customTypes={await getCustomCollectionTypes()}
      />
    </div>
  );
}