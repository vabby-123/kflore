import { db } from "@/lib/db";
import { categories, collections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/products";

export default async function NewProductPage() {
  const [categoriesList, collectionsList] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.name)),
    db.select().from(collections).orderBy(asc(collections.name)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Product</h1>
      <ProductForm action={createProduct} categories={categoriesList} collectionsList={collectionsList} />
    </div>
  );
}
