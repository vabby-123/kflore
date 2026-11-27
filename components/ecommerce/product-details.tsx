import { ChevronDown } from "lucide-react";

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group/section border-b border-taupe/20">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between py-4 text-xs font-medium uppercase tracking-label text-soft-black [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-taupe transition-transform group-open/section:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-soft-black/80">{children}</div>
    </details>
  );
}

const bulletList = "flex list-disc flex-col gap-1.5 pl-5";

/**
 * The expandable information under the order panel: description, what's included, flower care,
 * delivery and substitutions. Native <details>, so it needs no client JavaScript.
 */
export function ProductDetails({
  description,
  attributes,
  delivery,
}: {
  description?: string | null;
  attributes: { label: string; value?: string | null }[];
  delivery: { areas: string; orderCutOffTime?: string | null; charges?: string | null };
}) {
  const shown = attributes.filter((a) => a.value);

  return (
    <div className="flex flex-col border-t border-taupe/20">
      <Section title="Description" open>
        {description && <p className="whitespace-pre-line">{description}</p>}
        {shown.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-4">
            {shown.map((a) => (
              <div key={a.label}>
                <dt className="text-xs uppercase tracking-label text-taupe">{a.label}</dt>
                <dd className="text-soft-black">{a.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Section>

      <Section title="What's included">
        <ul className={bulletList}>
          <li>Fresh flowers, hand-arranged by our florists on the day of delivery</li>
          <li>Wrapping or presentation in the style pictured</li>
          <li>Your personal message card, if you add one</li>
          <li>Size M is fuller than R, in the same style and colour palette</li>
        </ul>
      </Section>

      <Section title="Flower care">
        <ul className={bulletList}>
          <li>Trim the stems at an angle and place in clean water as soon as you can</li>
          <li>For box arrangements, add a little water to the centre each day</li>
          <li>Keep away from direct sun, heat and fans; a cool spot helps them last</li>
          <li>Change the water every one to two days and remove wilted blooms</li>
        </ul>
      </Section>

      <Section title="Delivery information">
        <ul className={bulletList}>
          <li>Delivery area: {delivery.areas}</li>
          {delivery.orderCutOffTime && <li>Order cut-off: {delivery.orderCutOffTime}</li>}
          {delivery.charges && <li>Delivery charges: {delivery.charges}</li>}
          <li>Choose your date and preferred time above; we confirm timing on WhatsApp</li>
        </ul>
      </Section>

      <Section title="Freshness & substitutions">
        <p>
          Flowers are seasonal and each arrangement is made by hand, so yours may differ slightly from the photo. If a bloom isn&rsquo;t
          available, we use one of similar style, colour and value, and contact you first about any significant change.
        </p>
      </Section>
    </div>
  );
}
