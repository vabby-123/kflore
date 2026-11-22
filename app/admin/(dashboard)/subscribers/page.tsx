import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(500);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Newsletter Subscribers</h1>
      <DataTable
        rows={rows}
        emptyMessage="No subscribers yet."
        columns={[
          { header: "Email", render: (r) => r.email },
          { header: "Subscribed", render: (r) => r.createdAt.toLocaleDateString("en-MY") },
        ]}
      />
    </div>
  );
}