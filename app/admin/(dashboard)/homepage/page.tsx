import { getHomepageContent } from "@/lib/db/queries";
import { HomepageForm } from "@/components/admin/homepage-form";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const homepage = await getHomepageContent();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Homepage</h1>
      <HomepageForm initial={homepage} />
    </div>
  );
}
