"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  children,
  side = "right",
  title,
}: {
  className?: string;
  children: React.ReactNode;
  side?: "right" | "left" | "top";
  title: string;
}) {
  const sideClasses = {
    right: "right-0 top-0 h-full w-full max-w-md animate-[slide-right_0.45s_var(--ease-luxe)]",
    left: "left-0 top-0 h-full w-full max-w-sm animate-[slide-left_0.45s_var(--ease-luxe)]",
    top: "top-0 left-0 w-full max-h-[85svh] animate-[slide-down_0.35s_var(--ease-luxe)]",
  }[side];

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-soft-black/50 data-[state=open]:animate-fade-in" />
      <Dialog.Content
        className={cn(
          "fixed z-50 bg-ivory shadow-xl focus:outline-none flex flex-col",
          sideClasses,
          className
        )}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
        <Dialog.Close className="focus-ring absolute right-4 top-4 text-soft-black hover:text-burgundy" aria-label="Close">
          <X className="h-5 w-5" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };

