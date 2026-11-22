import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { getCollectionBySlug, getPublishedCollections, getPublishedProducts, getContactContent } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    return (await getPublishedCollections()).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return buildMetadata({
    title: collection.name,
    description: collection.description || `Explore the ${collection.name} collection from KFLORÉ.`,
    path: `/collections/${slug}`,
    image: collection.heroImage || collection.image || undefined,
  });
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection || collection.status !== "PUBLISHED") notFound();

  const [products, contact] = await Promise.all([
    getPublishedProducts({ collectionSlug: slug, limit: 48 }),
    getContactContent(),
  ]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "60123456789";

  return (
    <div className="container-kflore page-section flex flex-col gap-12">
      <Breadcrumbs items={[{ href: "/collections", label: "Collections" }, { label: collection.name }]} />
      <SectionHeading eyebrow="COLLECTION" title={collection.name} description={collection.description} align="left" />
      <ProductGrid products={products} whatsappNumber={whatsappNumber} priorityCount={4} />
    </div>
  );
}

