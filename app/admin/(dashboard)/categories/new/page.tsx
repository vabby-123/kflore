import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Category</h1>
      <TaxonomyForm action={createCategory} backHref="/admin/categories" />
    </div>
  );
}
