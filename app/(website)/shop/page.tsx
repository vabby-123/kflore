import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { ShopFilters } from "@/components/ecommerce/shop-filters";
import { countPublishedProducts, getPublishedCategories, getPublishedProducts, getContactContent } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Shop Flowers",
  description: "Shop KFLORÉ's full range of luxury bouquets, flower boxes and arrangements with same-day delivery.",
  path: "/shop",
});

const PAGE_SIZE = 12;
type Sort = "newest" | "price-asc" | "price-desc" | "name";
const SORTS: Sort[] = ["newest", "price-asc", "price-desc", "name"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const search = typeof sp.q === "string" ? sp.q.slice(0, 80) : undefined;
  const sort: Sort = SORTS.includes(sp.sort as Sort) ? (sp.sort as Sort) : "newest";
  const inStockOnly = sp.inStock === "1";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const query = { categorySlug: category, search, inStockOnly };
  const [categoriesList, total, pageProducts, contact] = await Promise.all([
    getPublishedCategories(),
    countPublishedProducts(query),
    getPublishedProducts({ ...query, sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    getContactContent(),
  ]);

  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "601160515983";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-kflore page-section flex flex-col gap-12">
      <SectionHeading eyebrow="SHOP FLOWERS" title="The Full Collection" align="left" />

      <ShopFilters categories={categoriesList} activeCategory={category} activeSort={sort} activeSearch={search} inStockOnly={inStockOnly} />

      <p className="-mt-6 text-xs text-taupe">{total} arrangement{total === 1 ? "" : "s"} found</p>

      <ProductGrid products={pageProducts} whatsappNumber={whatsappNumber} priorityCount={4} />

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            if (search) params.set("q", search);
            if (sort !== "newest") params.set("sort", sort);
            if (inStockOnly) params.set("inStock", "1");
            params.set("page", String(p));
            return (
              <a
                key={p}
                href={`/shop?${params.toString()}`}
                aria-current={p === page ? "page" : undefined}
                className={`focus-ring flex h-10 w-10 items-center justify-center border text-xs ${
                  p === page ? "border-burgundy bg-burgundy text-ivory" : "border-taupe/30 text-soft-black hover:border-burgundy"
                }`}
              >
                {p}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}
