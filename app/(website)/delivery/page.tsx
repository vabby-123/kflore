import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { buildGeneralEnquiryMessage } from "@/lib/whatsapp";
import { getDeliveryContent, getContactContent } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Same-Day Delivery",
  description: "KFLORÉ offers same-day flower delivery across Kuala Lumpur & Selangor.",
  path: "/delivery",
});

export default async function DeliveryPage() {
  const [delivery, contact] = await Promise.all([getDeliveryContent(), getContactContent()]);
  const whatsappNumber = contact.whatsapp || process.env.WHATSAPP_NUMBER || "60123456789";

  return (
    <div className="bg-burgundy section text-ivory">
      <div className="container-kflore flex flex-col items-center gap-12 text-center">
        <SectionHeading eyebrow="SAME-DAY DELIVERY" title="Thoughtful flowers, delivered when they matter most." light />

        <dl className="grid w-full max-w-3xl grid-cols-1 gap-8 border-y border-ivory/20 py-10 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-label text-gold">Delivery Area</dt>
            <dd className="text-sm text-ivory/90">{delivery.areas}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-label text-gold">Delivery Charges</dt>
            <dd className="text-sm text-ivory/90">{delivery.charges || "Please contact us for a delivery quote."}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-label text-gold">Order Cut-Off Time</dt>
            <dd className="text-sm text-ivory/90">{delivery.orderCutOffTime || "Please contact us for current cut-off times."}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-label text-gold">Same-Day Availability</dt>
            <dd className="text-sm text-ivory/90">{delivery.sameDayAvailable ? "Available" : "Currently unavailable — please check with us"}</dd>
          </div>
          {delivery.excludedAreas && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] uppercase tracking-label text-gold">Excluded Areas</dt>
              <dd className="text-sm text-ivory/90">{delivery.excludedAreas}</dd>
            </div>
          )}
          {delivery.publicHolidayNotes && (
            <div className="flex flex-col gap-1">
              <dt className="text-[11px] uppercase tracking-label text-gold">Public Holidays</dt>
              <dd className="text-sm text-ivory/90">{delivery.publicHolidayNotes}</dd>
            </div>
          )}
        </dl>

        {delivery.deliveryNotes && <p className="max-w-xl text-sm text-ivory/85">{delivery.deliveryNotes}</p>}

        <WhatsAppButton phoneNumber={whatsappNumber} message={buildGeneralEnquiryMessage()} label="ORDER VIA WHATSAPP" size="lg" />
      </div>
    </div>
  );
}


