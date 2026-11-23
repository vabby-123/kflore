import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGallery } from "@/components/ecommerce/product-gallery";
import { ProductOrderPanel } from "@/components/ecommerce/product-order-panel";
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
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-8">
          <ProductOrderPanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            stockStatus={product.stockStatus}
            variants={product.variants}
            deliveryEligible={product.deliveryEligible}
            whatsappNumber={whatsappNumber}
            imageUrl={product.images[0]?.url}
          />

          {product.description && (
            <div className="flex flex-col gap-2 border-t border-taupe/20 pt-6">
              <span className="text-xs uppercase tracking-label text-taupe">Description</span>
              <p className="whitespace-pre-line text-sm leading-relaxed text-soft-black">{product.description}</p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-4 border-t border-taupe/20 pt-6 text-sm">
            {product.flowerType && (
              <div>
                <dt className="text-xs uppercase tracking-label text-taupe">Flower Type</dt>
                <dd className="text-soft-black">{product.flowerType}</dd>
              </div>
            )}
            {product.colour && (
              <div>
                <dt className="text-xs uppercase tracking-label text-taupe">Colour</dt>
                <dd className="text-soft-black">{product.colour}</dd>
              </div>
            )}
            {product.occasion && (
              <div>
                <dt className="text-xs uppercase tracking-label text-taupe">Occasion</dt>
                <dd className="text-soft-black">{product.occasion}</dd>
              </div>
            )}
            {product.size && (
              <div>
                <dt className="text-xs uppercase tracking-label text-taupe">Size</dt>
                <dd className="text-soft-black">{product.size}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col gap-1 border-t border-taupe/20 pt-6 text-sm text-taupe">
            <span className="text-xs uppercase tracking-label text-burgundy">Delivery Information</span>
            <span>Delivery Area: {delivery.areas}</span>
            {delivery.orderCutOffTime && <span>Order Cut-Off: {delivery.orderCutOffTime}</span>}
            {delivery.charges && <span>Delivery Charges: {delivery.charges}</span>}
          </div>
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

