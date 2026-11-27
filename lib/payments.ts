import type { PaymentMethod } from "@/lib/validations/checkout";

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  billplz: "Card / FPX Online Banking",
  duitnow_qr: "DuitNow QR",
  tng_qr: "TNG eWallet",
  maybank_qr: "Maybank QRPay",
  bank_transfer: "Bank Transfer",
};

export const METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  billplz: "Cards, FPX online banking and e-wallets, paid securely on Billplz.",
  duitnow_qr: "Scan with any banking or e-wallet app.",
  tng_qr: "Pay with your Touch 'n Go eWallet.",
  maybank_qr: "Scan in your MAE or Maybank app.",
  bank_transfer: "Transfer directly to our bank account.",
};

/** What the shop has saved under Admin → Storefront: QR image URLs and the bank details text. */
export interface ManualMethods {
  tng_qr: string | null;
  duitnow_qr: string | null;
  maybank_qr: string | null;
  bank_transfer: string | null;
}
