import Image from "next/image";
import { METHOD_LABELS, type ManualMethods } from "@/lib/payments";
import { formatPriceMYR } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/validations/checkout";

/**
 * How to pay with a manual method: the saved QR or bank details. Until the shop has saved them,
 * the customer is told the details will be sent on WhatsApp.
 */
export function PaymentInstructions({
  method,
  amount,
  manualMethods,
}: {
  method: Exclude<PaymentMethod, "billplz">;
  amount: number | string;
  manualMethods: ManualMethods;
}) {
  const saved = manualMethods[method];
  const label = METHOD_LABELS[method];

  if (!saved) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-soft-black">
          Pay {formatPriceMYR(amount)} with {label}.
        </p>
        <p className="text-xs text-taupe">
          We&rsquo;ll send you our {label} payment details on WhatsApp. Your order is confirmed once we receive your payment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {method === "bank_transfer" ? (
        <>
          <p className="text-sm text-soft-black">Transfer {formatPriceMYR(amount)} to:</p>
          <p className="whitespace-pre-line border border-dashed border-taupe/40 bg-white p-3 text-sm text-soft-black">{saved}</p>
        </>
      ) : (
        <>
          <p className="text-sm text-soft-black">
            Scan to pay {formatPriceMYR(amount)} with {label}
          </p>
          <div className="relative aspect-square w-48 self-center overflow-hidden bg-white">
            <Image src={saved} alt={`${label} QR code`} fill sizes="192px" className="object-contain" />
          </div>
        </>
      )}
      <p className="text-xs text-taupe">Keep your payment receipt and send it to us on WhatsApp so we can confirm your order.</p>
    </div>
  );
}
