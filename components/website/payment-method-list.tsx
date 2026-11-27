"use client";

import { Check } from "lucide-react";
import { PaymentBadge } from "@/components/ecommerce/payment-badge";
import { PaymentInstructions } from "@/components/ecommerce/payment-instructions";
import { METHOD_DESCRIPTIONS, METHOD_LABELS, type ManualMethods } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/validations/checkout";

/** One row per method; the chosen one gets a green tick and opens its payment instructions. */
export function PaymentMethodList({
  methods,
  selected,
  onSelect,
  amount,
  manualMethods,
}: {
  methods: PaymentMethod[];
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  amount: number;
  manualMethods: ManualMethods;
}) {
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-3 font-serif-display text-lg text-soft-black">Select Payment Method</legend>
      <div className="flex flex-col divide-y divide-taupe/15 border border-taupe/25 bg-white">
        {methods.map((m) => {
          const active = selected === m;
          return (
            <div key={m}>
              <label className={cn("flex cursor-pointer items-center gap-4 px-4 py-4 transition-colors", active ? "bg-green-50" : "hover:bg-ivory")}>
                <input type="radio" name="paymentMethodChoice" value={m} checked={active} onChange={() => onSelect(m)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy peer-focus-visible:ring-offset-2",
                    active ? "border-green-600 bg-green-600 text-white" : "border-taupe/40 bg-white"
                  )}
                >
                  {active && <Check className="h-4 w-4" strokeWidth={3.5} />}
                </span>
                <PaymentBadge method={m} />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-soft-black">{METHOD_LABELS[m]}</span>
                  <span className="text-xs text-taupe">{METHOD_DESCRIPTIONS[m]}</span>
                </span>
              </label>
              {active && m !== "billplz" && (
                <div className="border-t border-taupe/15 bg-ivory px-4 py-4">
                  <PaymentInstructions method={m} amount={amount} manualMethods={manualMethods} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
