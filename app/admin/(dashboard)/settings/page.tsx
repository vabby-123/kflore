import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getContactContent } from "@/lib/db/queries";
import { ContactSettingsForm } from "@/components/admin/contact-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const contact = await getContactContent();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Settings</h1>
      <p className="max-w-2xl text-sm text-taupe">
        Business name, currency, timezone, and contact details used across the site. WhatsApp, phone, email, address,
        opening hours and social links can also be managed here or from the Contact page.
      </p>
      <ContactSettingsForm initial={contact} showBusinessFields />
    </div>
  );
}
