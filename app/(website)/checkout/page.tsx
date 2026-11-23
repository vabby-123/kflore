import { SectionHeading } from "@/components/shared/section-heading";
import { CheckoutForm } from "@/components/website/checkout-form";
import { isBillplzConfigured } from "@/lib/billplz";
import { getContactContent, getSiteSettings } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Checkout", description: "Complete your KFLORÉ order.", path: "/checkout" });

export default async function CheckoutPage() {
  const [contact, site] = await Promise.all([getContactContent(), getSiteSettings()]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "601160515983";

  const manualMethods = {
    tng_qr: site.paymentTngQrImage,
    duitnow_qr: site.paymentDuitnowQrImage,
    maybank_qr: site.paymentMaybankQrImage,
    bank_transfer: site.paymentBankDetails,
  };
  const billplzEnabled = isBillplzConfigured();
  return (
    <div className="container-kflore page-section flex flex-col gap-10">
      <SectionHeading eyebrow="CHECKOUT" title="Complete your order" align="left" />
      <CheckoutForm whatsappNumber={whatsappNumber} billplzEnabled={billplzEnabled} manualMethods={manualMethods} />
    </div>
  );
}
