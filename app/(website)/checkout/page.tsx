import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { CheckoutForm } from "@/components/website/checkout-form";
import { buttonVariants } from "@/components/ui/button";
import { isBillplzConfigured } from "@/lib/billplz";
import { getContactContent, getSiteSettings } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Checkout", description: "Complete your KFLORÉ order.", path: "/checkout" });

export default async function CheckoutPage() {
  const [contact, site] = await Promise.all([getContactContent(), getSiteSettings()]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "60123456789";

  const manualMethods = {
    tng_qr: site.paymentTngQrImage,
    duitnow_qr: site.paymentDuitnowQrImage,
    maybank_qr: site.paymentMaybankQrImage,
    bank_transfer: site.paymentBankDetails,
  };
  const billplzEnabled = isBillplzConfigured();
  const anyMethodAvailable = billplzEnabled || Object.values(manualMethods).some(Boolean);

  if (!anyMethodAvailable) {
    return (
      <div className="container-kflore page-section">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
          <SectionHeading eyebrow="CHECKOUT" title="Online payment is coming soon" />
          <p className="text-sm text-taupe">
            We&rsquo;re not set up to take online payments just yet — but we&rsquo;d still love to arrange your order over
            WhatsApp, same as always.
          </p>
          <Link href="/shop" className={buttonVariants({ variant: "secondary" })}>
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-kflore page-section flex flex-col gap-10">
      <SectionHeading eyebrow="CHECKOUT" title="Complete your order" align="left" />
      <CheckoutForm whatsappNumber={whatsappNumber} billplzEnabled={billplzEnabled} manualMethods={manualMethods} />
    </div>
  );
}
