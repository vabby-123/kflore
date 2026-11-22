import { buildGeneralEnquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function DeliveryBanner({
  areas,
  charges,
  cutOff,
  whatsappNumber,
}: {
  areas: string;
  charges?: string | null;
  cutOff?: string | null;
  whatsappNumber: string;
}) {
  return (
    <section aria-labelledby="delivery-heading" className="section-lg bg-burgundy text-ivory">
      <div className="container-kflore">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">Same-day delivery</p>
            <h2 id="delivery-heading" className="font-serif-display text-4xl leading-[1.1] md:text-6xl">
              {areas}
            </h2>
          </div>

          <dl className="grid w-full grid-cols-1 gap-8 border-y border-ivory/20 py-10 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-ivory/20">
            <div className="flex flex-col gap-2 sm:px-6">
              <dt className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Order before</dt>
              <dd className="text-base text-ivory/90">{cutOff || "Contact us for current cut-off times"}</dd>
            </div>
            <div className="flex flex-col gap-2 sm:px-6">
              <dt className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Delivery charge</dt>
              <dd className="text-base text-ivory/90">{charges || "Contact us for a quote"}</dd>
            </div>
          </dl>

          <a
            href={buildWhatsAppUrl(whatsappNumber, buildGeneralEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "gold", size: "lg" })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Order via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
