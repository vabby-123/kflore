const ITEMS = (areas: string) => [
  { title: "Same-day delivery", text: areas },
  { title: "Freshness", text: "Carefully selected blooms" },
  { title: "Handcrafted", text: "Designed by our floral team" },
  { title: "WhatsApp ordering", text: "Easy personal assistance" },
];

/** Slim benefits strip: hairline dividers, no cards. */
export function TrustStrip({ areas }: { areas: string }) {
  return (
    <section aria-label="Why KFLORÉ" className="border-b border-taupe/20">
      <div className="container-kflore">
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {ITEMS(areas).map((item, i) => (
            <li
              key={item.title}
              className={`flex flex-col gap-1.5 px-2 py-8 text-center sm:px-6 lg:py-10 ${
                i % 2 === 1 ? "border-l border-taupe/20" : ""
              } ${i > 0 ? "lg:border-l lg:border-taupe/20" : ""} ${i >= 2 ? "border-t border-taupe/20 lg:border-t-0" : ""}`}
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy">{item.title}</span>
              <span className="text-sm text-soft-black/70">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
