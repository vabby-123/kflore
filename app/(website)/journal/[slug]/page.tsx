import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { getJournalArticleBySlug, getLatestJournalArticles } from "@/lib/db/queries";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    return (await getLatestJournalArticles(50)).map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt || `${article.title} — from the KFLORÉ Journal.`,
    path: `/journal/${slug}`,
    image: article.image || undefined,
    type: "article",
  });
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = [
    articleJsonLd({
      title: article.title,
      description: article.excerpt,
      slug: article.slug,
      image: article.image,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    }),
    breadcrumbJsonLd([{ name: "Journal", path: "/journal" }, { name: article.title, path: `/journal/${slug}` }]),
  ];

  return (
    <article className="container-kflore page-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Breadcrumbs items={[{ href: "/journal", label: "Journal" }, { label: article.title }]} />
        <header className="flex flex-col gap-5">
          {article.category && <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">{article.category}</p>}
          <h1 className="font-serif-display text-4xl leading-[1.1] md:text-6xl">{article.title}</h1>
          {article.excerpt && <p className="text-lg leading-relaxed text-taupe">{article.excerpt}</p>}
        </header>
        {article.image && (
          <div className="relative aspect-[16/10] overflow-hidden bg-[#e6dccd]">
            <Image src={article.image} alt="" fill preload sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        {article.body && (
          <div className="flex flex-col gap-6 text-base leading-[1.85] text-soft-black/90">
            {article.body.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
