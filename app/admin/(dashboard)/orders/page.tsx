import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { EnquiryStatusSelect } from "@/components/admin/enquiry-status-select";
import { Badge } from "@/components/ui/badge";
import { formatPriceMYR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  CONTACT_FORM: "Contact Form",
  WHATSAPP_CART: "WhatsApp (Cart)",
  WHATSAPP_PRODUCT: "WhatsApp (Product)",
};

export default async function AdminOrdersPage() {
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Orders / Enquiries</h1>
      <p className="max-w-2xl text-sm text-taupe">
        Since KFLORÉ orders are confirmed via WhatsApp, this list tracks every enquiry submitted through the contact
        form so nothing falls through the cracks. Update status as you follow up.
      </p>

      <DataTable
        rows={rows}
        emptyMessage="No enquiries yet — they'll appear here as customers reach out."
        columns={[
          {
            header: "Customer",
            render: (e) => (
              <div className="flex flex-col">
                <span className="font-medium text-soft-black">{e.customerName}</span>
                <span className="text-xs text-taupe">{e.phone || e.email}</span>
              </div>
            ),
          },
          { header: "Source", render: (e) => <Badge variant="muted">{SOURCE_LABEL[e.source] ?? e.source}</Badge> },
          { header: "Product", render: (e) => e.interestedProduct || "—" },
          { header: "Delivery Area", render: (e) => e.deliveryArea || "—" },
          { header: "Value", render: (e) => (e.estimatedValue ? formatPriceMYR(e.estimatedValue) : "—") },
          { header: "Date", render: (e) => new Date(e.createdAt).toLocaleDateString() },
          { header: "Status", render: (e) => <EnquiryStatusSelect id={e.id} status={e.status} /> },
        ]}
      />
    </div>
  );
}
