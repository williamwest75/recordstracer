import { useAuth, TierKey } from "@/contexts/AuthContext";

const TIER_RANK: Record<TierKey, number> = {
  solo: 1,
  investigator: 2,
  newsroom: 3,
};

// Founding members get investigator-tier access
const FOUNDING_MEMBER_RANK = 2;

export const SEARCH_LIMITS: Record<TierKey, number> = {
  solo: 30,
  investigator: 200,
  newsroom: Infinity,
};

export const INVESTIGATION_LIMITS: Record<TierKey, number> = {
  solo: 3,
  investigator: Infinity,
  newsroom: Infinity,
};

export interface TierGating {
  /** Current effective tier rank (accounting for founding member status) */
  effectiveTierRank: number;
  /** Whether the user has at least the given tier */
  hasAccess: (requiredTier: TierKey) => boolean;
  /** Monthly search limit for current tier */
  searchLimit: number;
  /** Investigation limit for current tier */
  investigationLimit: number;
  /** Whether Deep Research is available */
  canUseDeepResearch: boolean;
  /** Whether Contact Intelligence is available */
  canUseContactIntel: boolean;
  /** Whether Dossier is available */
  canUseDossier: boolean;
  /** Whether Export (PDF/DOCX) is available */
  canExport: boolean;
  /** Whether investigation sharing is available */
  canShare: boolean;
  /** Whether the user is an admin (bypasses all gating) */
  isAdmin: boolean;
  /** The user's subscription tier */
  tier: TierKey | null;
}

export function useTierGating(isFoundingMember = false): TierGating {
  const { subscriptionTier, isAdmin } = useAuth();

  const tier = subscriptionTier;

  // Founding members get investigator-level access
  const baseTierRank = tier ? TIER_RANK[tier] : 0;
  const effectiveTierRank = isFoundingMember
    ? Math.max(baseTierRank, FOUNDING_MEMBER_RANK)
    : baseTierRank;

  const hasAccess = (requiredTier: TierKey): boolean => {
    if (isAdmin) return true;
    return effectiveTierRank >= TIER_RANK[requiredTier];
  };

  // For limits, use the effective tier (founding members = investigator)
  const effectiveTier: TierKey | null = isAdmin
    ? "newsroom"
    : isFoundingMember && (!tier || TIER_RANK[tier] < FOUNDING_MEMBER_RANK)
    ? "investigator"
    : tier;

  const searchLimit = isAdmin ? Infinity : (effectiveTier ? SEARCH_LIMITS[effectiveTier] : 0);
  const investigationLimit = isAdmin ? Infinity : (effectiveTier ? INVESTIGATION_LIMITS[effectiveTier] : 0);

  return {
    effectiveTierRank,
    hasAccess,
    searchLimit,
    investigationLimit,
    canUseDeepResearch: hasAccess("investigator"),
    canUseContactIntel: hasAccess("investigator"),
    canUseDossier: hasAccess("investigator"),
    canExport: hasAccess("investigator"),
    canShare: hasAccess("newsroom"),
    isAdmin,
    tier,
  };
}
