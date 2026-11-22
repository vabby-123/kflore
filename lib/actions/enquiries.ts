"use server";

import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { contactFormSchema } from "@/lib/validations/product";
import { sendEnquiryNotification } from "@/lib/email";

export interface EnquiryActionState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitContactForm(
  _prevState: EnquiryActionState,
  formData: FormData
): Promise<EnquiryActionState> {
  const raw = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
    interestedProduct: String(formData.get("interestedProduct") || ""),
    deliveryDate: String(formData.get("deliveryDate") || ""),
    deliveryArea: String(formData.get("deliveryArea") || ""),
  };

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  await db.insert(enquiries).values({
    customerName: data.name,
    phone: data.phone,
    email: data.email || null,
    message: data.message,
    interestedProduct: data.interestedProduct || null,
    deliveryArea: data.deliveryArea || null,
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
    source: "CONTACT_FORM",
    status: "NEW",
  });

  await sendEnquiryNotification({
    customerName: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    interestedProduct: data.interestedProduct,
  });

  return { success: true, message: "Thank you. We'll get back to you shortly." };
}
