import { Profession, ProfessionTier, RankLevel, RANK_LIMITS } from './types';
import { professionsConfig } from '@/config';

// ============================================================
// PROFESSION DATA - Loaded from configuration files
// ============================================================

// Build professions array from config
const buildProfessionFromConfig = (
  config: { id: string; name: string; icon: string; dependencies: string[] },
  tier: ProfessionTier
): Profession => ({
  id: config.id,
  name: config.name,
  tier,
  dependencies: config.dependencies,
});

export const PROFESSIONS: Profession[] = [
  ...professionsConfig.gathering.map(p => buildProfessionFromConfig(p, 'gathering')),
  ...professionsConfig.processing.map(p => buildProfessionFromConfig(p, 'processing')),
  ...professionsConfig.crafting.map(p => buildProfessionFromConfig(p, 'crafting')),
];

// Lookup maps for quick access
export const PROFESSION_BY_ID = new Map<string, Profession>(
  PROFESSIONS.map((p) => [p.id, p])
);

export const PROFESSIONS_BY_TIER: Record<ProfessionTier, Profession[]> = {
  gathering: PROFESSIONS.filter((p) => p.tier === 'gathering'),
  processing: PROFESSIONS.filter((p) => p.tier === 'processing'),
  crafting: PROFESSIONS.filter((p) => p.tier === 'crafting'),
};

// Tier display configuration - from config
export const TIER_CONFIG: Record<ProfessionTier, { label: string; icon: string; color: string }> = 
  professionsConfig.tiers as Record<ProfessionTier, { label: string; icon: string; color: string }>;

// Rank configuration - from config
export const RANK_CONFIG = professionsConfig.ranks as Record<string, { name: string; short: string; color: string }>;

// Get profession icon from config
export function getProfessionIcon(professionId: string): string {
  const allProfessions = [
    ...professionsConfig.gathering,
    ...professionsConfig.processing,
    ...professionsConfig.crafting,
  ];
  return allProfessions.find(p => p.id === professionId)?.icon || '❓';
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all dependencies for a profession (recursive - full supply chain)
 */
export function getFullDependencyChain(professionId: string): string[] {
  const visited = new Set<string>();
  const stack = [professionId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const profession = PROFESSION_BY_ID.get(current);
    
    if (profession) {
      for (const dep of profession.dependencies) {
        if (!visited.has(dep)) {
          visited.add(dep);
          stack.push(dep);
        }
      }
    }
  }

  return Array.from(visited);
}

/**
 * Calculate rank counts for a member (considering inheritance)
 * If someone is Grandmaster (4), they count for Master (3), Journeyman (2), and Apprentice (1) too
 */
export function calculateRankCounts(professionRanks: { rank: RankLevel }[]): Record<RankLevel, number> {
  const counts: Record<RankLevel, number> = { 4: 0, 3: 0, 2: 0, 1: 0 };
  
  for (const { rank } of professionRanks) {
    // Count at this level and all levels below
    for (let level = rank; level >= 1; level--) {
      counts[level as RankLevel]++;
    }
  }
  
  return counts;
}

/**
 * Check if a member exceeds the recommended rank limits
 * Returns warnings (not blocking errors)
 */
export function checkRankLimits(professionRanks: { rank: RankLevel }[]): string[] {
  const warnings: string[] = [];
  const effectiveCounts = calculateEffectiveRankCounts(professionRanks);
  
  // Check Grandmaster limit (max 2)
  if (effectiveCounts[4] > RANK_LIMITS[4]) {
    warnings.push(`Exceeds Grandmaster limit: ${effectiveCounts[4]}/${RANK_LIMITS[4]}`);
  }
  
  // Check Master limit (max 3, but GM counts)
  if (effectiveCounts[3] > RANK_LIMITS[3]) {
    warnings.push(`Exceeds Master limit: ${effectiveCounts[3]}/${RANK_LIMITS[3]}`);
  }
  
  return warnings;
}

/**
 * Calculate effective rank counts (how many professions at each level or above)
 * This is different from calculateRankCounts - here we count professions, not inherited levels
 */
export function calculateEffectiveRankCounts(professionRanks: { rank: RankLevel }[]): Record<RankLevel, number> {
  const counts: Record<RankLevel, number> = { 4: 0, 3: 0, 2: 0, 1: 0 };
  
  for (const { rank } of professionRanks) {
    counts[rank]++;
  }
  
  // Now calculate effective counts (GM counts as Master, Master counts as Journeyman, etc.)
  return {
    4: counts[4], // Pure Grandmaster count
    3: counts[4] + counts[3], // GM + Master
    2: counts[4] + counts[3] + counts[2], // GM + Master + Journeyman
    1: counts[4] + counts[3] + counts[2] + counts[1], // All
  };
}

/**
 * Get a summary string for a member's ranks
 * e.g., "2 GM | 1 M | 0 J | 2 A"
 */
export function getRankSummary(professionRanks: { rank: RankLevel }[]): string {
  const counts: Record<RankLevel, number> = { 4: 0, 3: 0, 2: 0, 1: 0 };
  
  for (const { rank } of professionRanks) {
    counts[rank]++;
  }
  
  return `${counts[4]} GM | ${counts[3]} M | ${counts[2]} J | ${counts[1]} A`;
}

