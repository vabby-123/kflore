"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateDeliverySettings } from "@/lib/actions/cms";
import type { deliverySettings } from "@/lib/db/schema";

type DeliverySettings = typeof deliverySettings.$inferSelect;

export function DeliveryForm({ initial }: { initial: DeliverySettings }) {
  const [state, formAction, pending] = useActionState(updateDeliverySettings, { success: false });
  if (state.success && state.message) toast.success(state.message);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5 border border-taupe/15 bg-white p-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="areas">Delivery Areas</Label>
        <Input id="areas" name="areas" defaultValue={initial.areas} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excludedAreas">Excluded Areas</Label>
        <Input id="excludedAreas" name="excludedAreas" defaultValue={initial.excludedAreas ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="sameDayAvailable" defaultChecked={initial.sameDayAvailable} className="h-4 w-4 accent-[#5A1725]" />
        Same-day delivery currently available
      </label>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="charges">Delivery Charges</Label>
        <Input id="charges" name="charges" defaultValue={initial.charges ?? ""} placeholder="e.g. RM 15 (KL) / RM 25 (Klang Valley)" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orderCutOffTime">Order Cut-Off Time</Label>
        <Input id="orderCutOffTime" name="orderCutOffTime" defaultValue={initial.orderCutOffTime ?? ""} placeholder="e.g. 2:00 PM for same-day delivery" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deliveryNotes">Delivery Notes</Label>
        <Textarea id="deliveryNotes" name="deliveryNotes" rows={3} defaultValue={initial.deliveryNotes ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="publicHolidayNotes">Public Holiday Notes</Label>
        <Textarea id="publicHolidayNotes" name="publicHolidayNotes" rows={2} defaultValue={initial.publicHolidayNotes ?? ""} />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </Button>
    </form>
  );
}
