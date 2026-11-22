import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { createCollection } from "@/lib/actions/collections";
import { getCustomCollectionTypes } from "@/lib/db/admin-queries";

export default async function NewCollectionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Collection</h1>
      <TaxonomyForm action={createCollection} backHref="/admin/collections" withCollectionFields customTypes={await getCustomCollectionTypes()} />
    </div>
  );
}