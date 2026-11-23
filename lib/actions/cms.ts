"use server";

import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { homepage, aboutPage, deliverySettings, contactSettings } from "@/lib/db/schema";
import { requireStaff } from "./guard";
import { revalidateStorefront } from "@/lib/revalidate";
import { logAudit } from "./audit";
import type { FormActionState } from "./categories";

function str(formData: FormData, key: string) {
  return String(formData.get(key) || "");
}

export async function updateHomepage(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const values = {
    aboutHeading: str(formData, "aboutHeading") || "Flowers with feeling.",
    aboutExcerpt: str(formData, "aboutExcerpt") || null,
    aboutImage: str(formData, "aboutImage") || null,
    instagramEnabled: formData.get("instagramEnabled") === "on",
    instagramHandle: str(formData, "instagramHandle") || null,
    testimonialsEnabled: formData.get("testimonialsEnabled") === "on",
  };

  await db
    .insert(homepage)
    .values({ id: "homepage", ...values, updatedAt: new Date() })
    .onConflictDoUpdate({ target: homepage.id, set: { ...values, updatedAt: new Date() } });

  await logAudit("update", "homepage");
  revalidatePath("/admin/homepage");
  revalidateStorefront();
  return { success: true, message: "Homepage updated." };
}
export async function updateAboutPage(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const valuesRaw = str(formData, "values");
  const values = valuesRaw ? valuesRaw.split(",").map((v) => v.trim()).filter(Boolean) : [];
  const yearsRaw = str(formData, "yearsOfExperience");

  const values_ = {
    familyFlorist: formData.get("familyFlorist") === "on",
    yearsOfExperience: yearsRaw ? parseInt(yearsRaw, 10) : null,
    founderName: str(formData, "founderName") || null,
    story: str(formData, "story") || null,
    mission: str(formData, "mission") || null,
    values,
    image: str(formData, "image") || null,
  };

  await db
    .insert(aboutPage)
    .values({ id: "about", ...values_, updatedAt: new Date() })
    .onConflictDoUpdate({ target: aboutPage.id, set: { ...values_, updatedAt: new Date() } });

  await logAudit("update", "about");
  revalidatePath("/admin/about");
  revalidatePath("/about");
  revalidateStorefront();
  return { success: true, message: "About page updated." };
}

export async function updateDeliverySettings(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const values = {
    areas: str(formData, "areas") || "Kuala Lumpur & Klang Valley",
    excludedAreas: str(formData, "excludedAreas") || null,
    sameDayAvailable: formData.get("sameDayAvailable") === "on",
    charges: str(formData, "charges") || null,
    orderCutOffTime: str(formData, "orderCutOffTime") || null,
    deliveryNotes: str(formData, "deliveryNotes") || null,
    publicHolidayNotes: str(formData, "publicHolidayNotes") || null,
  };

  await db
    .insert(deliverySettings)
    .values({ id: "delivery", ...values, updatedAt: new Date() })
    .onConflictDoUpdate({ target: deliverySettings.id, set: { ...values, updatedAt: new Date() } });

  await logAudit("update", "delivery");
  revalidatePath("/admin/delivery");
  revalidatePath("/delivery");
  revalidateStorefront();
  return { success: true, message: "Delivery settings updated." };
}

export async function updateContactSettings(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireStaff();
  const values = {
    businessName: str(formData, "businessName") || "KFLORÉ",
    // Accepts "011-6051 5983", "+60 11-6051 5983" or "601160515983"; stored with the country code for wa.me links.
    whatsapp: str(formData, "whatsapp") ? normalizeWhatsAppNumber(str(formData, "whatsapp")) : null,
    phone: str(formData, "phone") || null,
    email: str(formData, "email") || null,
    address: str(formData, "address") || null,
    googleMapsUrl: str(formData, "googleMapsUrl") || null,
    openingHours: str(formData, "openingHours") || null,
    instagram: str(formData, "instagram") || null,
    facebook: str(formData, "facebook") || null,
    tiktok: str(formData, "tiktok") || null,
    currency: str(formData, "currency") || "MYR",
    timezone: str(formData, "timezone") || "Asia/Kuala_Lumpur",
  };

  await db
    .insert(contactSettings)
    .values({ id: "contact", ...values, updatedAt: new Date() })
    .onConflictDoUpdate({ target: contactSettings.id, set: { ...values, updatedAt: new Date() } });

  await logAudit("update", "contact");
  revalidatePath("/admin/contact");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidateStorefront();
  return { success: true, message: "Contact settings updated." };
}
