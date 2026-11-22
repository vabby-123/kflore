import Link from "next/link";
import Image from "next/image";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { products, productImages, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceMYR } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      status: products.status,
      stockStatus: products.stockStatus,
      featured: products.featured,
      bestSeller: products.bestSeller,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const images = await db.select().from(productImages);
  const imageByProduct = new Map<string, string>();
  for (const img of images) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img.url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Products</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </Button>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No products yet — create your first arrangement."
        columns={[
          {
            header: "Image",
            render: (p) => (
              <div className="relative h-12 w-12 overflow-hidden bg-ivory">
                {imageByProduct.get(p.id) && <Image src={imageByProduct.get(p.id)!} alt="" fill sizes="48px" className="object-cover" />}
              </div>
            ),
          },
          {
            header: "Name",
            render: (p) => (
              <Link href={`/admin/products/${p.id}`} className="focus-ring font-medium text-soft-black hover:text-burgundy">
                {p.name}
              </Link>
            ),
          },
          { header: "Category", render: (p) => p.categoryName || "—" },
          { header: "Price", render: (p) => formatPriceMYR(p.price) },
          {
            header: "Status",
            render: (p) => (
              <div className="flex flex-wrap gap-1">
                <Badge variant={p.status === "PUBLISHED" ? "gold" : "muted"}>{p.status}</Badge>
                {p.featured && <Badge variant="burgundy">Featured</Badge>}
                {p.bestSeller && <Badge variant="solid">Best Seller</Badge>}
              </div>
            ),
          },
          { header: "Stock", render: (p) => p.stockStatus.replace(/_/g, " ") },
          {
            header: "",
            className: "text-right",
            render: (p) => <ConfirmDeleteButton itemLabel={p.name} action={deleteProduct.bind(null, p.id)} />,
          },
        ]}
      />
    </div>
  );
}
