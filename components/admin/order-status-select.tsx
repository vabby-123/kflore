"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderFulfillmentStatus } from "@/lib/actions/payments-admin";

const STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as (typeof STATUSES)[number];
        startTransition(async () => {
          await updateOrderFulfillmentStatus(id, value);
          toast.success(`Status updated to ${value}`);
        });
      }}
      className="focus-ring h-9 border border-taupe/40 bg-white px-2 text-xs uppercase tracking-label"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
