import { AnnouncementBar } from "@/components/website/announcement-bar";
import { SiteHeader } from "@/components/website/site-header";
import { Footer } from "@/components/website/footer";
import { CartProvider } from "@/lib/cart/cart-context";
import { isBillplzConfigured } from "@/lib/billplz";
import { getContactContent, getPublishedCollections, getSiteSettings } from "@/lib/db/queries";

// Public storefront is statically cached and refreshed every 5 minutes; admin edits also
// call revalidateStorefront() so changes appear immediately.
export const revalidate = 300;

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [contact, site, collections] = await Promise.all([
    getContactContent(),
    getSiteSettings(),
    getPublishedCollections(),
  ]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "60123456789";
  const navCollections = collections.map((c) => ({ name: c.name, slug: c.slug, type: c.type }));
  const paymentsEnabled =
    isBillplzConfigured() ||
    Boolean(site.paymentTngQrImage || site.paymentDuitnowQrImage || site.paymentMaybankQrImage || site.paymentBankDetails);

  return (
    <CartProvider>
      {/* Observed by <HeaderScrollState/> to flip the header from transparent to solid. */}
      <div id="header-sentinel" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10" />
      <AnnouncementBar site={site} />
      <SiteHeader whatsappNumber={whatsappNumber} collections={navCollections} paymentsEnabled={paymentsEnabled} />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} site={site} whatsappNumber={whatsappNumber} collections={navCollections} />
    </CartProvider>
  );
}
