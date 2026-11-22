import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { products, signaturePicks } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteSignaturePick } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default async function AdminSignaturePicksPage() {
  const rows = await db
    .select({
      id: signaturePicks.id,
      title: signaturePicks.title,
      enabled: signaturePicks.enabled,
      startDate: signaturePicks.startDate,
      endDate: signaturePicks.endDate,
      productName: products.name,
    })
    .from(signaturePicks)
    .leftJoin(products, eq(products.id, signaturePicks.productId))
    .orderBy(desc(signaturePicks.startDate), desc(signaturePicks.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Signature Picks</h1>
        <Button asChild size="sm">
          <Link href="/admin/signature-picks/new">
            <Plus className="h-4 w-4" /> New Pick
          </Link>
        </Button>
      </div>
      <p className="text-sm text-taupe">
        The homepage shows the enabled pick whose dates contain today. Add one per month to schedule ahead; the storefront rolls over automatically.
      </p>
      <DataTable
        rows={rows}
        emptyMessage="No signature picks yet. The section stays hidden until one is active."
        columns={[
          { header: "Pick", render: (r) => <Link href={`/admin/signature-picks/${r.id}`} className="focus-ring font-medium hover:text-burgundy">{r.title || r.productName || "Untitled"}</Link> },
          { header: "Product", render: (r) => r.productName ?? "—" },
          { header: "Starts", render: (r) => fmt(r.startDate) },
          { header: "Ends", render: (r) => fmt(r.endDate) },
          { header: "Status", render: (r) => <Badge variant={r.enabled ? "gold" : "muted"}>{r.enabled ? "ENABLED" : "OFF"}</Badge> },
          { header: "", className: "text-right", render: (r) => <ConfirmDeleteButton itemLabel={r.title || r.productName || "this pick"} action={deleteSignaturePick.bind(null, r.id)} /> },
        ]}
      />
    </div>
  );
}