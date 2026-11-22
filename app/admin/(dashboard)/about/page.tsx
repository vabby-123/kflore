import { getAboutContent } from "@/lib/db/queries";
import { AboutForm } from "@/components/admin/about-form";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await getAboutContent();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">About Us</h1>
      <AboutForm initial={about} />
    </div>
  );
}
