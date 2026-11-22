import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, collections, productImages, productVariants, productCollections } from "@/lib/db/schema";
import { products } from "@/lib/db/schema";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/lib/actions/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) notFound();

  const [categoriesList, collectionsList, images, variants, links] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.name)),
    db.select().from(collections).orderBy(asc(collections.name)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
    db.select().from(productCollections).where(eq(productCollections.productId, id)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Product</h1>
      <ProductForm
        action={updateProduct.bind(null, id)}
        categories={categoriesList}
        collectionsList={collectionsList}
        initial={{
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categoryId: product.categoryId,
          tags: product.tags,
          featured: product.featured,
          bestSeller: product.bestSeller,
          status: product.status,
          stockStatus: product.stockStatus,
          occasion: product.occasion,
          flowerType: product.flowerType,
          colour: product.colour,
          size: product.size,
          deliveryEligible: product.deliveryEligible,
          images: images.map((i) => ({ url: i.url, altText: i.altText ?? undefined })),
          variants: variants.map((v) => ({
            name: v.name,
            sku: v.sku ?? undefined,
            price: v.price ? parseFloat(v.price) : undefined,
            stock: v.stock ?? undefined,
          })),
          collectionIds: links.map((l) => l.collectionId),
        }}
      />
    </div>
  );
}
