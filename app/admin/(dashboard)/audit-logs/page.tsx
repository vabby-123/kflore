import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Audit Logs</h1>
      <p className="max-w-2xl text-sm text-taupe">
        A record of admin actions — product, category, collection, CMS and user changes — for accountability.
      </p>

      <DataTable
        rows={rows}
        emptyMessage="No activity recorded yet."
        columns={[
          { header: "When", render: (r) => new Date(r.createdAt).toLocaleString() },
          { header: "User", render: (r) => r.userName || "System" },
          { header: "Action", render: (r) => r.action },
          { header: "Entity", render: (r) => r.entity },
          { header: "Details", render: (r) => r.details || "—" },
        ]}
      />
    </div>
  );
}
