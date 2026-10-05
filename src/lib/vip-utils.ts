/**
 * Effective cutoff date/time for new reseller VIP promotion rules.
 * Resellers registering on or after this timestamp are evaluated under the updated tier rules.
 */
export const VIP_RULES_EFFECTIVE_TIMESTAMP = "2026-09-24T00:00:00.000Z";

export interface VipTierConfig {
  level: number;
  label: string;
  minDeposit: number;
  maxDeposit: number | null;
  productLimit: number;
  marginProfit: number;
  rechargeToNext: number | null;
  nextLevel: number | null;
}

/**
 * Standard VIP Level Configuration for resellers registering from the effective date.
 * - VIP0: 0 - 999 USD (Max Products: 20, Max Profit: 15%, Accumulate $1,000 to Level 1)
 * - VIP1: 1,000 - 4,999 USD (Max Products: 30, Max Profit: 20%, Accumulate $5,000 to Level 2)
 * - VIP2: 5,000 - 9,999 USD (Max Products: 40, Max Profit: 25%, Accumulate $10,000 to Level 3)
 * - VIP3: 10,000 - 49,999 USD (Max Products: 50, Max Profit: 30%, Accumulate $50,000 to Level 4)
 * - VIP4: 50,000 - 99,999 USD (Max Products: 100, Max Profit: 35%, Accumulate $100,000 to Level 5)
 * - VIP5: 100,000+ USD (Max Products: 150, Max Profit: 40%, Top Tier)
 */
export const VIP_LEVELS: VipTierConfig[] = [
  { level: 0, label: "VIP-0", minDeposit: 0, maxDeposit: 999, productLimit: 20, marginProfit: 0.15, rechargeToNext: 1000, nextLevel: 1 },
  { level: 1, label: "VIP-1", minDeposit: 1000, maxDeposit: 4999, productLimit: 30, marginProfit: 0.20, rechargeToNext: 5000, nextLevel: 2 },
  { level: 2, label: "VIP-2", minDeposit: 5000, maxDeposit: 9999, productLimit: 40, marginProfit: 0.25, rechargeToNext: 10000, nextLevel: 3 },
  { level: 3, label: "VIP-3", minDeposit: 10000, maxDeposit: 49999, productLimit: 50, marginProfit: 0.30, rechargeToNext: 50000, nextLevel: 4 },
  { level: 4, label: "VIP-4", minDeposit: 50000, maxDeposit: 99999, productLimit: 100, marginProfit: 0.35, rechargeToNext: 100000, nextLevel: 5 },
  { level: 5, label: "VIP-5", minDeposit: 100000, maxDeposit: null, productLimit: 150, marginProfit: 0.40, rechargeToNext: null, nextLevel: null },
];

/**
 * Checks if a reseller was registered on or after the new VIP rule effective date/time.
 */
export function isNewResellerPromotionRuleActive(registrationDate?: string | Date | null): boolean {
  if (!registrationDate) return false;
  try {
    const regTime = new Date(registrationDate).getTime();
    const cutoffTime = new Date(VIP_RULES_EFFECTIVE_TIMESTAMP).getTime();
    if (isNaN(regTime)) return false;
    return regTime >= cutoffTime;
  } catch {
    return false;
  }
}

/**
 * Retrieves the applicable VIP tiers based on registration time and date.
 */
export function getVipTiers(registrationDate?: string | Date | null): VipTierConfig[] {
  return VIP_LEVELS;
}

/**
 * Calculates the VIP level based on net deposit amount or available balance
 * and checks registration time/date to apply the promotion rule without demoting existing resellers.
 */
export const calculateVipLevel = (
  netDeposits: number, 
  currentLevel: number = 0, 
  registrationDate?: string | Date | null,
  availableBalance?: number
): number => {
  const isNew = isNewResellerPromotionRuleActive(registrationDate);
  const tiers = getVipTiers(registrationDate);
  
  const qualificationAmount = Math.max(
    Number(netDeposits || 0),
    Number(availableBalance || 0)
  );
  
  // Sort descending to find the highest deposit tier achieved
  const metTier = [...tiers]
    .sort((a, b) => b.minDeposit - a.minDeposit)
    .find(v => qualificationAmount >= v.minDeposit);
    
  const newCalculatedLevel = metTier ? metTier.level : 0;
  
  // Only sanitize for NEWLY registered resellers after the effective cutoff date.
  // Existing resellers registered before the cutoff keep their VIP 1 status intact.
  const effectiveCurrentLevel = (isNew && currentLevel === 1 && qualificationAmount < 1000) 
    ? 0 
    : currentLevel;
  
  // Return higher of the two to prevent demotion
  return Math.max(effectiveCurrentLevel, newCalculatedLevel);
};

/**
 * Gets the product limit for a specific VIP level
 */
export const getVipProductLimit = (level: number | string, registrationDate?: string | Date | null): number => {
  const levelNum = typeof level === 'string' ? Number(level.replace(/[^0-9]/g, '')) || 0 : level;
  const tiers = getVipTiers(registrationDate);
  const tierInfo = tiers.find(v => v.level === levelNum);
  return tierInfo ? tierInfo.productLimit : 20;
};

/**
 * Gets the margin profit percentage for a specific VIP level
 */
export const getVipMarginProfit = (level: number | string, registrationDate?: string | Date | null): number => {
  const levelNum = typeof level === 'string' ? Number(level.replace(/[^0-9]/g, '')) || 0 : level;
  const tiers = getVipTiers(registrationDate);
  const tierInfo = tiers.find(v => v.level === levelNum);
  return tierInfo ? tierInfo.marginProfit : 0.15;
};

/**
 * Gets the label for a specific VIP level (e.g. 'VIP-0', 'VIP-1', etc.)
 */
export const getVipLabel = (level: number | string): string => {
  const levelNum = typeof level === 'string' ? Number(level.replace(/[^0-9]/g, '')) || 0 : level;
  const tierInfo = VIP_LEVELS.find(v => v.level === levelNum);
  return tierInfo ? tierInfo.label : `VIP-${levelNum}`;
};

/**
 * Helper to get full detail for a reseller's level
 */
export const getVipDetails = (level: number | string, registrationDate?: string | Date | null): VipTierConfig => {
  const levelNum = typeof level === 'string' ? Number(level.replace(/[^0-9]/g, '')) || 0 : level;
  const tiers = getVipTiers(registrationDate);
  return tiers.find(v => v.level === levelNum) || tiers[0];
};
