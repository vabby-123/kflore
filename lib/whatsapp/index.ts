export interface WhatsAppCartLine {
  name: string;
  variant?: string | null;
  quantity: number;
  price: number;
}

function digitsOnly(phone: string) {
  return phone.replace(/[^0-9]/g, "");
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
  if (params.customerMessage) {
    lines.push(`Message: ${params.customerMessage}`, "");
  }
  lines.push("Please let me know the availability and delivery details.");
  return lines.join("\n");
}

export function buildCartOrderMessage(params: {
  items: WhatsAppCartLine[];
  subtotal: number;
  deliveryLocation?: string;
}): string {
  const lines = ["KFLORÉ ORDER ENQUIRY", ""];
  for (const item of params.items) {
    lines.push(`${item.quantity} × ${item.name}`);
    if (item.variant) lines.push(`Size: ${item.variant}`);
    lines.push(`RM ${(item.price * item.quantity).toFixed(2)}`, "");
  }
  lines.push(`Subtotal: RM ${params.subtotal.toFixed(2)}`, "");
  lines.push(`Delivery location: ${params.deliveryLocation?.trim() || "[Please advise]"}`);
  return lines.join("\n");
}
