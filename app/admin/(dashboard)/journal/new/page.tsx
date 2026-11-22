import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "@/lib/actions/storefront";

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Article</h1>
      <ArticleForm action={createArticle} />
    </div>
  );
}