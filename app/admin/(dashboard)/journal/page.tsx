import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { journalArticles } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteArticle } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const rows = await db
    .select({ id: journalArticles.id, title: journalArticles.title, category: journalArticles.category, status: journalArticles.status, publishedAt: journalArticles.publishedAt })
    .from(journalArticles)
    .orderBy(desc(journalArticles.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Journal</h1>
        <Button asChild size="sm">
          <Link href="/admin/journal/new">
            <Plus className="h-4 w-4" /> New Article
          </Link>
        </Button>
      </div>
      <p className="text-sm text-taupe">The homepage Journal section is hidden until at least one article is published.</p>
      <DataTable
        rows={rows}
        emptyMessage="No articles yet."
        columns={[
          { header: "Title", render: (a) => <Link href={`/admin/journal/${a.id}`} className="focus-ring font-medium hover:text-burgundy">{a.title}</Link> },
          { header: "Category", render: (a) => a.category ?? "—" },
          { header: "Published", render: (a) => (a.publishedAt ? a.publishedAt.toLocaleDateString("en-MY") : "—") },
          { header: "Status", render: (a) => <Badge variant={a.status === "PUBLISHED" ? "gold" : "muted"}>{a.status}</Badge> },
          { header: "", className: "text-right", render: (a) => <ConfirmDeleteButton itemLabel={a.title} action={deleteArticle.bind(null, a.id)} /> },
        ]}
      />
    </div>
  );
}