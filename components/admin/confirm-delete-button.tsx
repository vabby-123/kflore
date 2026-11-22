"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  action,
  itemLabel,
}: {
  action: () => Promise<void>;
  itemLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="focus-ring text-taupe hover:text-burgundy" aria-label={`Delete ${itemLabel}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-soft-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white p-6">
          <Dialog.Title className="font-serif-display text-lg text-soft-black">Delete {itemLabel}?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-taupe">
            This action cannot be undone.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await action();
                  setOpen(false);
                });
              }}
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
