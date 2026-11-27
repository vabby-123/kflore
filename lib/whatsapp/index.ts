export interface WhatsAppCartLine {
  name: string;
  variant?: string | null;
  quantity: number;
  price: number;
}

function digitsOnly(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

/** "601160515983" / "011-6051 5983" / "+60 11-6051 5983" -> "601160515983" (wa.me needs country code, no "+"). */
export function normalizeWhatsAppNumber(input: string): string {
  let d = digitsOnly(input);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "6" + d; // Malaysian local format 011-... -> 6011-...
  return d;
}

/** Human-readable Malaysian format: "601160515983" -> "+60 11-6051 5983". Other numbers are returned as typed. */
export function formatPhoneDisplay(input: string): string {
  const d = normalizeWhatsAppNumber(input);
  const m = d.match(/^60(1\d)(\d{3,4})(\d{4})$/);
  if (m) return `+60 ${m[1]}-${m[2]} ${m[3]}`;
  const k = d.match(/^60(\d{1,2})(\d{3,4})(\d{4})$/);
  if (k) return `+60 ${k[1]}-${k[2]} ${k[3]}`;
  return input;
}

/** "2026-12-24" -> "Thursday, 24 Dec 2026" (parsed as a local date so the weekday never shifts). */
export function formatDeliveryDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const phone = digitsOnly(phoneNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralEnquiryMessage(): string {
  return "Hi KFLORÉ, I would like to enquire about your flowers.";
}

export function buildProductOrderMessage(params: {
  productName: string;
  variant?: string | null;
  quantity: number;
  price?: string | null;
  customerMessage?: string;
  deliveryDate?: string;
  timeSlot?: string;
  deliveryLocation?: string;
}): string {
  const lines = [
    "Hi KFLORÉ,",
    "I would like to order:",
    "",
    `Product: ${params.productName}`,
  ];
  if (params.variant) lines.push(`Size/Option: ${params.variant}`);
  lines.push(`Quantity: ${params.quantity}`);
  if (params.price) lines.push(`Price: ${params.price}`);
  lines.push("");
  if (params.deliveryDate) lines.push(`Delivery date: ${formatDeliveryDate(params.deliveryDate)}`);
  if (params.timeSlot) lines.push(`Preferred time: ${params.timeSlot}`);
  if (params.deliveryLocation?.trim()) lines.push(`Delivery location: ${params.deliveryLocation.trim()}`);
  if (params.customerMessage?.trim()) {
    lines.push(`Message card: ${params.customerMessage.trim()}`, "");
  }
  lines.push("Please let me know the availability and delivery details.");
  return lines.join("\n");
}

export function buildCartOrderMessage(params: {
  items: WhatsAppCartLine[];
  subtotal: number;
  deliveryLocation?: string;
  deliveryDate?: string;
  timeSlot?: string;
  cardMessage?: string;
  discountCode?: string;
  discountAmount?: number;
}): string {
  const lines = ["KFLORÉ ORDER ENQUIRY", ""];
  for (const item of params.items) {
    lines.push(`${item.quantity} × ${item.name}`);
    if (item.variant) lines.push(`Size: ${item.variant}`);
    lines.push(`RM ${(item.price * item.quantity).toFixed(2)}`, "");
  }
  lines.push(`Subtotal: RM ${params.subtotal.toFixed(2)}`);
  if (params.discountCode && params.discountAmount) {
    lines.push(`Discount (${params.discountCode}): -RM ${params.discountAmount.toFixed(2)}`);
    lines.push(`Total: RM ${(params.subtotal - params.discountAmount).toFixed(2)}`);
  }
  lines.push("");
  lines.push(`Delivery date: ${params.deliveryDate ? formatDeliveryDate(params.deliveryDate) : "[Please advise]"}`);
  if (params.timeSlot) lines.push(`Preferred time: ${params.timeSlot}`);
  lines.push(`Delivery location: ${params.deliveryLocation?.trim() || "[Please advise]"}`);
  lines.push(`Message card: ${params.cardMessage?.trim() || "None"}`);
  return lines.join("\n");
}
