"use client";

import dynamic from "next/dynamic";

// Toasts are only needed after an interaction, so keep sonner out of the initial bundle.
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export function LazyToaster() {
  return <Toaster position="bottom-center" richColors closeButton />;
}