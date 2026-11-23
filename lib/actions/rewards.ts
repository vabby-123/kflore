"use server";

import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscribers, rewardLedger, rewardMembers } from "@/lib/db/schema";
import { JOIN_BONUS_POINTS, WELCOME_CODE, WELCOME_MIN_SPEND, WELCOME_PERCENT } from "@/lib/rewards";

export interface RewardsState {
  success: boolean;
  message: string;
  /** Set by the lookup action. */
  points?: number;
  firstName?: string;
  history?: { points: number; reason: string; date: string }[];
}

const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email address.").max(255);

/** Sign-up popup: adds the email to the newsletter and reveals the welcome code. */
export async function claimWelcomeOffer(_prev: RewardsState, formData: FormData): Promise<RewardsState> {
  if (String(formData.get("company") || "")) return { success: true, message: "Thank you!" };
  const email = emailSchema.safeParse(String(formData.get("email") || ""));
  if (!email.success) return { success: false, message: email.error.issues[0]?.message ?? "Invalid email." };

  await db.insert(newsletterSubscribers).values({ email: email.data }).onConflictDoNothing();
  return {
    success: true,
    message: `You're in! Use code ${WELCOME_CODE} at checkout for ${WELCOME_PERCENT}% off (minimum spend RM ${WELCOME_MIN_SPEND}).`,
  };
}

const joinSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: emailSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

/** Becomes a Flower Points member (and gets the join bonus). Joining again with the same email is harmless. */
export async function joinRewards(_prev: RewardsState, formData: FormData): Promise<RewardsState> {
  if (String(formData.get("company") || "")) return { success: true, message: "Welcome!" };
  const parsed = joinSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  const { name, email, phone } = parsed.data;

  const [existing] = await db.select().from(rewardMembers).where(eq(rewardMembers.email, email));
  if (existing) {
    return { success: true, message: `Welcome back, ${existing.name.split(" ")[0]}! You have ${existing.points} points.`, points: existing.points };
  }

  const [member] = await db
    .insert(rewardMembers)
    .values({ name, email, phone: phone || null, points: JOIN_BONUS_POINTS })
    .returning();
  await db.insert(rewardLedger).values({ memberId: member.id, points: JOIN_BONUS_POINTS, reason: "Welcome bonus" });
  await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();

  return {
    success: true,
    message: `You're a member! ${JOIN_BONUS_POINTS} welcome points added. Shop with this email to keep earning.`,
    points: JOIN_BONUS_POINTS,
  };
}

/** Looks up a member's balance by email. Only the first name, balance and a short history are returned. */
export async function lookupPoints(_prev: RewardsState, formData: FormData): Promise<RewardsState> {
  const email = emailSchema.safeParse(String(formData.get("email") || ""));
  if (!email.success) return { success: false, message: email.error.issues[0]?.message ?? "Invalid email." };

  const [member] = await db.select().from(rewardMembers).where(eq(rewardMembers.email, email.data));
  if (!member) return { success: false, message: "No membership found for that email. Join below to start earning." };

  const rows = await db
    .select({ points: rewardLedger.points, reason: rewardLedger.reason, createdAt: rewardLedger.createdAt })
    .from(rewardLedger)
    .where(eq(rewardLedger.memberId, member.id))
    .orderBy(desc(rewardLedger.createdAt))
    .limit(5);

  return {
    success: true,
    message: "",
    points: member.points,
    firstName: member.name.split(" ")[0],
    history: rows.map((r) => ({ points: r.points, reason: r.reason, date: r.createdAt.toISOString().slice(0, 10) })),
  };
}
