"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markOrderPaidManually } from "@/lib/actions/payments-admin";

export function MarkPaidButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="gold"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await markOrderPaidManually(id);
            toast.success("Marked as paid");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't update this order");
          }
        })
      }
    >
      {pending ? "Saving…" : "Mark as Paid"}
    </Button>
  );
}
