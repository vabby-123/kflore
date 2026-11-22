import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteCategory } from "@/lib/actions/categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Categories</h1>
        <Button asChild size="sm">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" /> New Category
          </Link>
        </Button>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No categories yet."
        columns={[
          { header: "Name", render: (c) => <Link href={`/admin/categories/${c.id}`} className="focus-ring font-medium hover:text-burgundy">{c.name}</Link> },
          { header: "Slug", render: (c) => c.slug },
          { header: "Sort Order", render: (c) => c.sortOrder },
          { header: "Status", render: (c) => <Badge variant={c.status === "PUBLISHED" ? "gold" : "muted"}>{c.status}</Badge> },
          { header: "", className: "text-right", render: (c) => <ConfirmDeleteButton itemLabel={c.name} action={deleteCategory.bind(null, c.id)} /> },
        ]}
      />
    </div>
  );
}
