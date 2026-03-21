/**
 * Loyalty Points Engine — ported from Spirit Fire Tobacco
 * Handles tier calculations, point earning, bonus logic, and redemption validation.
 */

export const TIERS = {
  INSIDER: { name: "Insider", minSpend: 0, multiplier: 1, discount: 0, color: "#9ca3af" },
  VIP: { name: "VIP", minSpend: 500, multiplier: 1.5, discount: 5, color: "#f59e0b" },
  ELITE: { name: "Elite", minSpend: 1500, multiplier: 2, discount: 10, color: "#C8E63E" },
  DIAMOND: { name: "Diamond", minSpend: 5000, multiplier: 3, discount: 15, color: "#8b5cf6" },
} as const;

export type TierName = keyof typeof TIERS;

/** 1 point per $1 spent, multiplied by tier */
export function calculatePointsEarned(orderTotal: number, tierMultiplier: number): number {
  return Math.floor(orderTotal * tierMultiplier);
}

/** Determine tier from annual spend */
export function getTierFromSpend(annualSpend: number): TierName {
  if (annualSpend >= TIERS.DIAMOND.minSpend) return "DIAMOND";
  if (annualSpend >= TIERS.ELITE.minSpend) return "ELITE";
  if (annualSpend >= TIERS.VIP.minSpend) return "VIP";
  return "INSIDER";
}

/** Get next tier info */
export function getNextTier(currentTier: TierName): { name: string; remaining: number; minSpend: number } | null {
  const order: TierName[] = ["INSIDER", "VIP", "ELITE", "DIAMOND"];
  const idx = order.indexOf(currentTier);
  if (idx >= order.length - 1) return null;
  const next = order[idx + 1];
  return { name: TIERS[next].name, remaining: TIERS[next].minSpend, minSpend: TIERS[next].minSpend };
}

/** Progress toward next tier (0-100) */
export function getTierProgress(totalSpend: number, currentTier: TierName): number {
  const next = getNextTier(currentTier);
  if (!next) return 100;
  const currentMin = TIERS[currentTier].minSpend;
  const range = next.minSpend - currentMin;
  const progress = totalSpend - currentMin;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

/** Bonus point multipliers for special events */
export function calculateBonusPoints(
  basePoints: number,
  eventType: "birthday" | "double_points" | "welcome" | "review" | "photo_review" | "referral"
): number {
  const multipliers: Record<string, number> = {
    birthday: 2,
    double_points: 2,
    welcome: 0, // flat 100 bonus
    review: 0, // flat 50 bonus
    photo_review: 0, // flat 100 bonus
    referral: 0, // flat 200 bonus
  };
  const flatBonuses: Record<string, number> = {
    welcome: 100,
    review: 50,
    photo_review: 100,
    referral: 200,
  };
  const multiplier = multipliers[eventType] ?? 1;
  const flat = flatBonuses[eventType] ?? 0;
  return multiplier > 0 ? basePoints * multiplier : flat;
}

/** 100 points = $1 discount */
export function pointsToDollars(points: number): number {
  return Math.floor(points / 100);
}

/** Check if points have expired (12 months inactivity) */
export function arePointsExpired(lastActivityDate: Date): boolean {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  return lastActivityDate < twelveMonthsAgo;
}

/** Validate a redemption request */
export function validateRedemption(
  currentPoints: number,
  redeemAmount: number
): { valid: boolean; error?: string } {
  if (redeemAmount < 100) return { valid: false, error: "Minimum redemption is 100 points ($1)" };
  if (redeemAmount % 100 !== 0) return { valid: false, error: "Points must be redeemed in multiples of 100" };
  if (redeemAmount > currentPoints) return { valid: false, error: "Insufficient points balance" };
  return { valid: true };
}
