// TypeScript types for the AoC Profession Planner

// Profession tier types
export type ProfessionTier = 'gathering' | 'processing' | 'crafting';

// Rank levels (1-4)
export type RankLevel = 1 | 2 | 3 | 4;

// Rank names mapped to levels
export const RANK_NAMES: Record<RankLevel, string> = {
  1: 'Apprentice',
  2: 'Journeyman',
  3: 'Master',
  4: 'Grandmaster',
};

// Rank limits per player
export const RANK_LIMITS: Record<RankLevel, number> = {
  4: 2,  // Max 2 Grandmaster
  3: 3,  // Max 3 Master (includes GM)
  2: 4,  // Max 4 Journeyman (includes M+GM)
  1: 5,  // Max 5 Apprentice (includes J+M+GM)
};

// Profession definition
export interface Profession {
  id: string;
  name: string;
  tier: ProfessionTier;
  dependencies: string[]; // IDs of required professions
}

// Database types
export interface Clan {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: string;
  clan_id: string;
  name: string;
  created_at: string;
}

export interface MemberProfession {
  id: string;
  member_id: string;
  profession: string;
  rank: RankLevel;
}

// Extended member with professions loaded
export interface MemberWithProfessions extends Member {
  professions: MemberProfession[];
}

// Clan coverage statistics
export interface ProfessionCoverage {
  profession: string;
  grandmasters: string[]; // member names
  masters: string[];
  journeymen: string[];
  apprentices: string[];
}

// Rank color configuration
export const RANK_COLORS: Record<RankLevel, { text: string; border: string; bg: string; glow: string }> = {
  4: { 
    text: 'text-orange-400', 
    border: 'border-orange-500', 
    bg: 'bg-orange-500/20',
    glow: 'shadow-orange-500/50'
  },
  3: { 
    text: 'text-purple-400', 
    border: 'border-purple-500', 
    bg: 'bg-purple-500/20',
    glow: 'shadow-purple-500/50'
  },
  2: { 
    text: 'text-blue-400', 
    border: 'border-blue-500', 
    bg: 'bg-blue-500/20',
    glow: 'shadow-blue-500/50'
  },
  1: { 
    text: 'text-green-400', 
    border: 'border-green-500', 
    bg: 'bg-green-500/20',
    glow: 'shadow-green-500/50'
  },
};
