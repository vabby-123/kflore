import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "The terms and conditions governing use of the KFLORÉ website and ordering process.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-kflore page-section flex flex-col gap-8">
      <SectionHeading eyebrow="LEGAL" title="Terms & Conditions" align="left" />
      <div className="flex max-w-3xl flex-col gap-5 text-sm leading-relaxed text-taupe">
        <p className="text-soft-black">
          <strong>Placeholder content.</strong> This page must be reviewed and finalised by KFLORÉ&rsquo;s management
          (and ideally legal counsel) before launch. No company registration details or legally-binding claims have
          been invented here.
        </p>
        <p>
          Orders placed through this website are enquiries confirmed directly with our team via WhatsApp or phone.
          Prices, availability and delivery timelines are subject to confirmation at the time of order.
        </p>
        <p>
          Same-day delivery is offered on a best-effort basis within our stated delivery area and cut-off time, and
          may be affected by weather, traffic or public holidays.
        </p>
        <p>
          Product photography is representative; due to the natural variation of fresh flowers, minor differences in
          colour, bloom and packaging may occur.
        </p>
      </div>
    </div>
  );
}

