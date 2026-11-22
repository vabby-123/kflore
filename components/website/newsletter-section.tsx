import { NewsletterForm } from "@/components/website/newsletter-form";

export function NewsletterSection({ heading, text }: { heading: string; text: string }) {
  return (
    <section aria-labelledby="newsletter-heading" className="section border-t border-taupe/20">
      <div className="container-kflore">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h2 id="newsletter-heading" className="font-serif-display text-3xl uppercase leading-tight tracking-[0.06em] md:text-4xl">
            {heading}
          </h2>
          <p className="text-sm leading-relaxed text-taupe md:text-base">{text}</p>
          <NewsletterForm className="mt-2 max-w-md" />
        </div>
      </div>
    </section>
  );
}
