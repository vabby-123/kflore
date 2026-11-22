import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/admin/user-form";
import { createUser, toggleUserActive, deleteUser } from "@/lib/actions/users";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const rows = await db.select().from(users).orderBy(asc(users.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif-display text-2xl text-soft-black">Admin Users</h1>

      <DataTable
        rows={rows}
        emptyMessage="No users yet."
        columns={[
          { header: "Name", render: (u) => u.name },
          { header: "Email", render: (u) => u.email },
          { header: "Role", render: (u) => <Badge variant={u.role === "ADMIN" ? "burgundy" : "muted"}>{u.role}</Badge> },
          {
            header: "Status",
            render: (u) => (
              <form action={toggleUserActive.bind(null, u.id, !u.active)}>
                <button type="submit" className="focus-ring text-xs uppercase tracking-label underline underline-offset-4">
                  {u.active ? "Active — deactivate" : "Inactive — activate"}
                </button>
              </form>
            ),
          },
          { header: "", className: "text-right", render: (u) => <ConfirmDeleteButton itemLabel={u.name} action={deleteUser.bind(null, u.id)} /> },
        ]}
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-serif-display text-lg text-soft-black">Add User</h2>
        <UserForm action={createUser} />
      </div>
    </div>
  );
}
