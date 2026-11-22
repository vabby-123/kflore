import { getHomepageSections, getSiteSettings } from "@/lib/db/queries";
import { StorefrontForm } from "@/components/admin/storefront-form";

export const dynamic = "force-dynamic";

export default async function AdminStorefrontPage() {
  const [site, sections] = await Promise.all([getSiteSettings(), getHomepageSections()]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Storefront</h1>
      <StorefrontForm initial={site} sections={sections} />
    </div>
  );
}