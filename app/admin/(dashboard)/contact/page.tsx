import { getContactContent } from "@/lib/db/queries";
import { ContactSettingsForm } from "@/components/admin/contact-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contact = await getContactContent();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Contact Settings</h1>
      <ContactSettingsForm initial={contact} showBusinessFields={false} />
    </div>
  );
}
