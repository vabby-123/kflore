import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(50),
});

/** Fixed delivery windows — kept as plain labels (not an enum) so they're easy to adjust later. */
export const DELIVERY_TIME_SLOTS = [
  "Morning (10am – 12pm)",
  "Afternoon (2pm – 5pm)",
  "Evening (6pm – 8pm)",
] as const;

/** Today's date (yyyy-mm-dd) in the shop's time zone, wherever the code runs. */
export function shopToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

/** Same-day orders can't be delivered in the morning slot. */
export function availableTimeSlots(date: string): readonly string[] {
  return date && date === shopToday() ? DELIVERY_TIME_SLOTS.filter((s) => !s.startsWith("Morning")) : DELIVERY_TIME_SLOTS;
}

export const PAYMENT_METHODS = ["billplz", "tng_qr", "duitnow_qr", "maybank_qr", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z.string().trim().min(6, "Please enter a valid phone number").max(30),
  // Required for Billplz (receipt); optional for manual methods, but still useful for confirmation.
  email: z.string().trim().max(255).optional().or(z.literal("")),
  deliveryAddress: z.string().trim().min(10, "Please enter a full delivery address").max(500),
  deliveryDate: z.string().min(1, "Please select a delivery date"),
  deliveryTimeSlot: z.string().max(60).optional().or(z.literal("")),
  cardMessage: z.string().trim().max(300).optional().or(z.literal("")),
  deliveryNotes: z.string().trim().max(300).optional().or(z.literal("")),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  method: z.enum(PAYMENT_METHODS),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
}).refine((d) => d.method !== "billplz" || z.string().email().safeParse(d.email).success, {
  message: "A valid email is required for card/FPX payment (your receipt is sent here).",
  path: ["email"],
}).refine((d) => !d.deliveryTimeSlot || availableTimeSlots(d.deliveryDate).includes(d.deliveryTimeSlot), {
  message: "That time isn't available for the chosen date. Please pick another.",
  path: ["deliveryTimeSlot"],
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
