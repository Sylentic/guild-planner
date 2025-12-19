import { Profession, ProfessionTier, RankLevel, RANK_LIMITS } from './types';

// ============================================================
// PROFESSION DATA - Based on official Ashes of Creation sources
// ============================================================

export const PROFESSIONS: Profession[] = [
  // ================== GATHERING (5) ==================
  { id: 'mining', name: 'Mining', tier: 'gathering', dependencies: [] },
  { id: 'lumberjacking', name: 'Lumberjacking', tier: 'gathering', dependencies: [] },
  { id: 'herbalism', name: 'Herbalism', tier: 'gathering', dependencies: [] },
  { id: 'fishing', name: 'Fishing', tier: 'gathering', dependencies: [] },
  { id: 'hunting', name: 'Hunting', tier: 'gathering', dependencies: [] },

  // ================== PROCESSING (9) ==================
  { id: 'metalworking', name: 'Metalworking', tier: 'processing', dependencies: ['mining'] },
  { id: 'lumber_milling', name: 'Lumber Milling', tier: 'processing', dependencies: ['lumberjacking'] },
  { id: 'stonemasonry', name: 'Stonemasonry', tier: 'processing', dependencies: ['mining'] },
  { id: 'weaving', name: 'Weaving', tier: 'processing', dependencies: ['herbalism', 'farming'] },
  { id: 'tanning', name: 'Tanning', tier: 'processing', dependencies: ['hunting'] },
  { id: 'alchemy', name: 'Alchemy', tier: 'processing', dependencies: ['herbalism'] },
  { id: 'farming', name: 'Farming', tier: 'processing', dependencies: ['herbalism'] },
  { id: 'animal_husbandry', name: 'Animal Husbandry', tier: 'processing', dependencies: ['hunting'] },
  { id: 'cooking', name: 'Cooking', tier: 'processing', dependencies: ['fishing', 'farming', 'animal_husbandry'] },

  // ================== CRAFTING (8) ==================
  { id: 'weapon_smithing', name: 'Weapon Smithing', tier: 'crafting', dependencies: ['metalworking', 'lumber_milling'] },
  { id: 'armor_smithing', name: 'Armor Smithing', tier: 'crafting', dependencies: ['metalworking', 'weaving', 'tanning'] },
  { id: 'leatherworking', name: 'Leatherworking', tier: 'crafting', dependencies: ['tanning'] },
  { id: 'tailoring', name: 'Tailoring', tier: 'crafting', dependencies: ['weaving', 'tanning'] },
  { id: 'jewelcrafting', name: 'Jewelcrafting', tier: 'crafting', dependencies: ['stonemasonry', 'metalworking'] },
  { id: 'carpentry', name: 'Carpentry', tier: 'crafting', dependencies: ['lumber_milling', 'metalworking'] },
  { id: 'arcane_engineering', name: 'Arcane Engineering', tier: 'crafting', dependencies: ['lumber_milling', 'metalworking', 'jewelcrafting'] },
  { id: 'scribe', name: 'Scribe', tier: 'crafting', dependencies: ['lumber_milling', 'alchemy', 'tanning'] },
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

// Tier display configuration
export const TIER_CONFIG: Record<ProfessionTier, { label: string; icon: string; color: string }> = {
  gathering: { label: 'Gathering', icon: '🪓', color: 'text-amber-400' },
  processing: { label: 'Processing', icon: '⚙️', color: 'text-cyan-400' },
  crafting: { label: 'Crafting', icon: '🔨', color: 'text-rose-400' },
};

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
