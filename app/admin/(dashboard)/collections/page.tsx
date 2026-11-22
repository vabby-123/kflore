import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteCollection } from "@/lib/actions/collections";
import { collectionTypeLabel } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const rows = await db.select().from(collections).orderBy(asc(collections.type), asc(collections.sortOrder));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Collections</h1>
        <Button asChild size="sm">
          <Link href="/admin/collections/new">
            <Plus className="h-4 w-4" /> New Collection
          </Link>
        </Button>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No collections yet."
        columns={[
          { header: "Name", render: (c) => <Link href={`/admin/collections/${c.id}`} className="focus-ring font-medium hover:text-burgundy">{c.name}</Link> },
          { header: "Type", render: (c) => collectionTypeLabel(c.type) },
          { header: "Homepage", render: (c) => (c.featured ? <Badge variant="burgundy">{c.homepagePosition ? `#${c.homepagePosition}` : "Featured"}</Badge> : "—") },
          { header: "Sort", render: (c) => c.sortOrder },
          { header: "Status", render: (c) => <Badge variant={c.status === "PUBLISHED" ? "gold" : "muted"}>{c.status}</Badge> },
          { header: "", className: "text-right", render: (c) => <ConfirmDeleteButton itemLabel={c.name} action={deleteCollection.bind(null, c.id)} /> },
        ]}
      />
    </div>
  );
}