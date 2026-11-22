import { SectionHeading } from "@/components/shared/section-heading";
import { getDeliveryContent } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to common questions about ordering, delivery and care for your KFLORÉ flowers.",
  path: "/faq",
});

export default async function FaqPage() {
  const delivery = await getDeliveryContent();

  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse our Shop or Collections, then order directly via WhatsApp from any product page, or add items to your cart and send your order enquiry via WhatsApp at checkout.",
    },
    {
      q: "Do you offer same-day delivery?",
      a: `Yes — same-day delivery is available across ${delivery.areas}${
        delivery.orderCutOffTime ? `, subject to our order cut-off time of ${delivery.orderCutOffTime}` : ""
      }.`,
    },
    {
      q: "What are your delivery charges?",
      a: delivery.charges || "Delivery charges vary by location — please contact us on WhatsApp for a quote.",
    },
    {
      q: "Can I customise my arrangement?",
      a: "Absolutely. Message us on WhatsApp with your preferences — colour palette, budget, and occasion — and our florists will guide you.",
    },
    {
      q: "How do I pay for my order?",
      a: "Payment details are confirmed directly with our team over WhatsApp once your order and delivery details are finalised.",
    },
  ];

  return (
    <div className="container-kflore page-section flex flex-col gap-12">
      <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" align="left" />
      <div className="flex flex-col divide-y divide-taupe/20 border-y border-taupe/20">
        {faqs.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="focus-ring flex cursor-pointer items-center justify-between text-sm font-medium text-soft-black">
              {item.q}
              <span className="text-taupe transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-taupe">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}


