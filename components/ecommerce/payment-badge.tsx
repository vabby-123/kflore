import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/validations/checkout";

/** Simple text badges in each method's familiar colour (not the official logos). */
const BADGES: Record<PaymentMethod, { top: string; bottom: string; className: string }> = {
  billplz: { top: "FPX", bottom: "CARD", className: "bg-slate-800 text-white" },
  duitnow_qr: { top: "DuitNow", bottom: "QR", className: "bg-pink-600 text-white" },
  tng_qr: { top: "Touch ’n Go", bottom: "eWALLET", className: "bg-blue-700 text-yellow-300" },
  maybank_qr: { top: "Maybank", bottom: "QRPAY", className: "bg-yellow-400 text-black" },
  bank_transfer: { top: "BANK", bottom: "TRANSFER", className: "border border-soft-black/20 bg-white text-soft-black" },
};

export function PaymentBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  const badge = BADGES[method];
  return (
    <span aria-hidden="true" className={cn("flex h-10 w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-sm leading-tight", badge.className, className)}>
      <span className="text-[10px] font-bold">{badge.top}</span>
      <span className="text-[9px] font-semibold tracking-wider">{badge.bottom}</span>
    </span>
  );
}
