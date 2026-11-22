import { getDeliveryContent } from "@/lib/db/queries";
import { DeliveryForm } from "@/components/admin/delivery-form";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const delivery = await getDeliveryContent();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Delivery Settings</h1>
      <DeliveryForm initial={delivery} />
    </div>
  );
}
