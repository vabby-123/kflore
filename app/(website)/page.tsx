import { HeroCarousel } from "@/components/website/hero-carousel";
import { TrustStrip } from "@/components/website/trust-strip";
import { ProductShowcase } from "@/components/website/product-showcase";
import { ProductCard } from "@/components/ecommerce/product-card";
import { SignaturePick } from "@/components/website/signature-pick";
import { CollectionMosaic } from "@/components/website/collection-mosaic";
import { AboutTeaser } from "@/components/website/about-teaser";
import { DeliveryBanner } from "@/components/website/delivery-banner";
import { JournalSection } from "@/components/website/journal-section";
import { NewsletterSection } from "@/components/website/newsletter-section";
import { getHomepageData, getPublishedCollections } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";
import type { HomepageSectionKey } from "@/lib/homepage-sections";

export const revalidate = 120;

export const metadata = buildMetadata({
  title: "KFLORÉ | Luxury Floral Arrangements & Flowers",
  description:
    "KFLORÉ creates timeless floral arrangements designed to make every occasion unforgettable. Luxury bouquets, boxes and same-day delivery across Kuala Lumpur & Selangor.",
  path: "/",
});

export default async function HomePage() {
  const data = await getHomepageData();
  const { home, site, sections, slides, delivery, contact, signature, journal, bestSellers, newIn } = data;
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "60123456789";

  // Admin picks which collections are featured; if none are, fall back to the first few published ones.
  const mosaic = data.featuredCollections.length > 0 ? data.featuredCollections : (await getPublishedCollections()).slice(0, 6);

  const panels = [
    { id: "best", label: "Bestsellers", products: bestSellers },
    { id: "new", label: "New in", products: newIn },
  ]
    .filter((p) => p.products.length > 0)
    .map((p) => ({
      id: p.id,
      label: p.label,
      cards: p.products.map((product) => (
        <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 72vw" />
      )),
    }));

  const content: Record<HomepageSectionKey, React.ReactNode> = {
    featured:
      panels.length > 0 ? (
        <section key="featured" aria-label="Featured flowers" className="section-lg">
          <div className="container-kflore">
            <div className="mx-auto max-w-[1320px]">
              <ProductShowcase heading={site.featuredHeading} eyebrow="Curated for you" panels={panels} />
            </div>
          </div>
        </section>
      ) : null,
    signature: signature ? <SignaturePick key="signature" data={signature} whatsappNumber={whatsappNumber} /> : null,
    collections: <CollectionMosaic key="collections" collections={mosaic} />,
    about: (
      <AboutTeaser
        key="about"
        heading={home.aboutHeading}
        excerpt={home.aboutExcerpt}
        image={home.aboutImage || "/images/placeholders/about-story.svg"}
      />
    ),
    delivery: (
      <DeliveryBanner
        key="delivery"
        areas={delivery.areas}
        charges={delivery.charges}
        cutOff={delivery.orderCutOffTime}
        whatsappNumber={whatsappNumber}
      />
    ),
    journal: <JournalSection key="journal" articles={journal} />,
    newsletter: <NewsletterSection key="newsletter" heading={site.newsletterHeading} text={site.newsletterText} />,
  };

  const ordered = (Object.keys(content) as HomepageSectionKey[])
    .filter((k) => sections[k].enabled)
    .sort((a, b) => sections[a].sortOrder - sections[b].sortOrder);

  return (
    <>
      {/* Marker read by CSS (`body:has([data-hero-page])`) to make the header transparent over the hero. */}
      <div data-hero-page hidden />
      <HeroCarousel slides={slides} />
      <TrustStrip areas={delivery.areas} />
      {ordered.map((k) => content[k])}
    </>
  );
}
