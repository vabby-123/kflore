"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";

export interface NewsletterState {
  success: boolean;
  message: string;
}

const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email address.").max(255);

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  // Honeypot: real visitors never fill this field.
  if (String(formData.get("company") || "")) return { success: true, message: "Thank you for subscribing." };

  const parsed = emailSchema.safeParse(String(formData.get("email") || ""));
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email." };

  await db.insert(newsletterSubscribers).values({ email: parsed.data }).onConflictDoNothing();
  return { success: true, message: "Thank you. You're on the list." };
}
