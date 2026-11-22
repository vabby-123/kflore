import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { journalArticles } from "@/lib/db/schema";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article] = await db.select().from(journalArticles).where(eq(journalArticles.id, id));
  if (!article) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Article</h1>
      <ArticleForm action={updateArticle.bind(null, id)} initial={article} />
    </div>
  );
}