/**
 * KFLORÉ rewards + welcome-offer rules. Pure data/functions only (no DB), so the same rules run in the
 * browser (to preview a discount) and on the server (the authoritative check at checkout).
 */

export const WELCOME_CODE = "WELCOME10";
export const WELCOME_PERCENT = 10;
export const WELCOME_MIN_SPEND = 200;

/** 1 point for every RM 1 paid (rounded down), credited once an order is marked paid. */
export const POINTS_PER_RM = 1;
export const JOIN_BONUS_POINTS = 50;

export const REWARD_TIERS = [
  { points: 500, title: "RM 10 off your next order", detail: "Redeem 500 points" },
  { points: 1000, title: "RM 25 off your next order", detail: "Redeem 1,000 points" },
  { points: 2000, title: "Free premium add-on (card + ribbon upgrade)", detail: "Redeem 2,000 points" },
] as const;

export const WAYS_TO_EARN = [
  { label: "Join KFLORÉ Flower Points", points: `+${JOIN_BONUS_POINTS} points` },
  { label: "Every RM 1 you spend", points: `+${POINTS_PER_RM} point` },
  { label: "Sign up to our newsletter", points: `${WELCOME_PERCENT}% off your first order` },
] as const;

export interface DiscountResult {
  valid: boolean;
  /** RM amount taken off (0 when invalid). */
  amount: number;
  code: string;
  message: string;
}

/** Validates a code against a cart total. Whether the customer has already used it is checked server-side. */
export function evaluateDiscount(rawCode: string, subtotal: number): DiscountResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, amount: 0, code, message: "" };
  if (code !== WELCOME_CODE) return { valid: false, amount: 0, code, message: "That code isn't valid." };
  if (subtotal < WELCOME_MIN_SPEND) {
    return { valid: false, amount: 0, code, message: `${WELCOME_CODE} needs a minimum spend of RM ${WELCOME_MIN_SPEND}.` };
  }
  const amount = Math.round(subtotal * WELCOME_PERCENT) / 100;
  return { valid: true, amount, code, message: `${WELCOME_PERCENT}% off applied.` };
}
