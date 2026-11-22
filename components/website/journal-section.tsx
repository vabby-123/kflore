import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  image: string | null;
}

/** Hidden entirely when there are no published articles: no fake cards. */
export function JournalSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="journal-heading" className="section">
      <div className="container-kflore">
        <div className="section-header mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-burgundy">Floral stories</p>
          <h2 id="journal-heading" className="font-serif-display text-4xl leading-[1.1] md:text-5xl">
            The KFLORÉ Journal
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1320px] gap-x-8 gap-y-14 md:grid-cols-3">
          {articles.map((a) => (
            <article key={a.id} className="group flex flex-col gap-5">
              <Link href={`/journal/${a.slug}`} className="focus-ring relative block aspect-[4/3] overflow-hidden bg-[#e6dccd]" aria-label={a.title}>
                {a.image && (
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                  />
                )}
              </Link>
              <div className="flex flex-col items-start gap-3">
                {a.category && <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold">{a.category}</p>}
                <h3 className="font-serif-display text-2xl leading-snug">
                  <Link href={`/journal/${a.slug}`} className="focus-ring hover:text-burgundy">
                    {a.title}
                  </Link>
                </h3>
                {a.excerpt && <p className="text-sm leading-relaxed text-taupe">{a.excerpt}</p>}
                <Link
                  href={`/journal/${a.slug}`}
                  className="focus-ring mt-1 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-burgundy"
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
