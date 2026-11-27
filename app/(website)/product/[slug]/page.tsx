import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGallery } from "@/components/ecommerce/product-gallery";
import { ProductOrderPanel } from "@/components/ecommerce/product-order-panel";
import { ProductDetails } from "@/components/ecommerce/product-details";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { getProductBySlug, getPublishedProducts, getPublishedProductSlugs, getContactContent, getDeliveryContent } from "@/lib/db/queries";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";

export const revalidate = 300;

// Pre-render the catalogue at build time; new products are rendered on first request, then cached (ISR).
export async function generateStaticParams() {
  try {
    return await getPublishedProductSlugs();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.shortDescription || product.description || `${product.name} — luxury florals from KFLORÉ.`,
    path: `/product/${slug}`,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "PUBLISHED") notFound();

  const [related, contact, delivery] = await Promise.all([
    getPublishedProducts({ categorySlug: product.category?.slug, limit: 4 }),
    getContactContent(),
    getDeliveryContent(),
  ]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "601160515983";
  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 4);

  const jsonLd = productJsonLd({
    name: product.name,
    description: product.shortDescription,
    price: product.price,
    slug: product.slug,
    image: product.images[0]?.url,
    availability: product.stockStatus === "OUT_OF_STOCK" ? "OutOfStock" : "InStock",
  });

  return (
    <div className="container-kflore page-section flex flex-col gap-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd([{ name: "Shop", path: "/shop" }, { name: product.name, path: `/product/${product.slug}` }])]) }} />

      <Breadcrumbs
        items={[
          { href: "/shop", label: "Shop" },
          ...(product.category ? [{ href: `/shop?category=${product.category.slug}`, label: product.category.name }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="flex flex-col gap-8">
          <ProductOrderPanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            shortDescription={product.shortDescription}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            stockStatus={product.stockStatus}
            variants={product.variants}
            deliveryEligible={product.deliveryEligible}
            whatsappNumber={whatsappNumber}
            imageUrl={product.images[0]?.url}
          />

          <ProductDetails
            description={product.description}
            delivery={delivery}
            attributes={[
              { label: "Flower Type", value: product.flowerType },
              { label: "Colour", value: product.colour },
              { label: "Occasion", value: product.occasion },
              { label: "Size", value: product.size },
            ]}
          />
        </div>
      </div>

      {relatedFiltered.length > 0 && (
        <div className="flex flex-col gap-8 border-t border-taupe/20 pt-16">
          <SectionHeading eyebrow="YOU MAY ALSO LIKE" title="More from this collection" align="left" />
          <ProductGrid products={relatedFiltered} whatsappNumber={whatsappNumber} columns={4} />
        </div>
      )}
    </div>
  );
}

