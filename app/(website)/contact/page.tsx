import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/components/website/contact-form";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { buildGeneralEnquiryMessage } from "@/lib/whatsapp";
import { getContactContent } from "@/lib/db/queries";
import { buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Get in touch with KFLORÉ via WhatsApp, phone, or email.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getContactContent();
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "601160515983";

  const jsonLd = localBusinessJsonLd({
    businessName: contact.businessName,
    address: contact.address,
    phone: contact.phone,
    openingHours: contact.openingHours,
  });

  return (
    <div className="container-kflore page-section flex flex-col gap-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SectionHeading eyebrow="GET IN TOUCH" title="We'd love to hear from you" align="left" />

      <div className="grid gap-14 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <WhatsAppButton phoneNumber={whatsappNumber} message={buildGeneralEnquiryMessage()} label="CHAT WITH US ON WHATSAPP" size="lg" className="w-fit" />
            <dl className="flex flex-col gap-3 text-sm">
              {contact.phone && (
                <div>
                  <dt className="text-xs uppercase tracking-label text-taupe">Phone</dt>
                  <dd className="text-soft-black">{contact.phone}</dd>
                </div>
              )}
              {contact.email && (
                <div>
                  <dt className="text-xs uppercase tracking-label text-taupe">Email</dt>
                  <dd className="text-soft-black">{contact.email}</dd>
                </div>
              )}
              {contact.address && (
                <div>
                  <dt className="text-xs uppercase tracking-label text-taupe">Address</dt>
                  <dd className="text-soft-black">{contact.address}</dd>
                </div>
              )}
              {contact.openingHours && (
                <div>
                  <dt className="text-xs uppercase tracking-label text-taupe">Opening Hours</dt>
                  <dd className="whitespace-pre-line text-soft-black">{contact.openingHours}</dd>
                </div>
              )}
            </dl>
            {contact.googleMapsUrl && (
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring w-fit text-xs uppercase tracking-label text-burgundy underline underline-offset-4"
              >
                View on Google Maps
              </a>
            )}
          </div>

        </div>

        <div className="bg-white p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}


