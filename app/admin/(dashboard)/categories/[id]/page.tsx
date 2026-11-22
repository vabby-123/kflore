import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { updateCategory } from "@/lib/actions/categories";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category] = await db.select().from(categories).where(eq(categories.id, id));
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Category</h1>
      <TaxonomyForm action={updateCategory.bind(null, id)} backHref="/admin/categories" initial={category} />
    </div>
  );
}
