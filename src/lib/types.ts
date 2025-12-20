// TypeScript types for the AoC Guild Planner

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
  discord_webhook_url?: string;
  notify_on_events?: boolean;
  notify_on_announcements?: boolean;
}

// Race and Archetype types (match database ENUMs)
export type Race = 'kaelar' | 'vaelune' | 'dunir' | 'nikua' | 
                   'empyrean' | 'pyrai' | 'renkai' | 'vek' | 'tulnar';

export type Archetype = 'tank' | 'cleric' | 'mage' | 'fighter' | 
                        'ranger' | 'bard' | 'rogue' | 'summoner';

// Character (formerly Member) - represents a game character
export interface Character {
  id: string;
  clan_id: string;
  user_id: string | null;
  name: string;
  race: Race | null;
  primary_archetype: Archetype | null;
  secondary_archetype: Archetype | null;
  level: number;
  is_main: boolean;
  created_at: string;
}

// Legacy alias for compatibility
export type Member = Character;

export interface MemberProfession {
  id: string;
  member_id: string;
  profession: string;
  rank: RankLevel;
}

// Extended character with professions loaded
export interface CharacterWithProfessions extends Character {
  professions: MemberProfession[];
}

// Legacy alias for compatibility
export type MemberWithProfessions = CharacterWithProfessions;

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

// Party types
export type PartyRole = 'tank' | 'healer' | 'dps' | 'support';

export interface Party {
  id: string;
  clan_id: string;
  name: string;
  description?: string;
  tanks_needed: number;
  healers_needed: number;
  dps_needed: number;
  support_needed: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PartyRoster {
  id: string;
  party_id: string;
  character_id: string;
  role: PartyRole;
  is_confirmed: boolean;
  assigned_at: string;
}

export interface PartyWithRoster extends Party {
  roster: (PartyRoster & { character?: CharacterWithProfessions })[];
}

// Party role configuration
export const PARTY_ROLES: Record<PartyRole, { name: string; icon: string; color: string }> = {
  tank: { name: 'Tank', icon: '🛡️', color: 'text-blue-400' },
  healer: { name: 'Healer', icon: '💚', color: 'text-green-400' },
  dps: { name: 'DPS', icon: '⚔️', color: 'text-red-400' },
  support: { name: 'Support', icon: '✨', color: 'text-yellow-400' },
};

export interface RecruitmentApplication {
  id: string;
  clan_id: string;
  user_id?: string;
  discord_username: string;
  character_name?: string;
  primary_class?: string;
  experience?: string;
  availability?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

// ============================================================
// NODE CITIZENSHIP TYPES
// ============================================================

// Node types in AoC (4 types)
export type NodeType = 'divine' | 'economic' | 'military' | 'scientific';

// Node stages (0-6)
export type NodeStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Node stage names
export const NODE_STAGE_NAMES: Record<NodeStage, string> = {
  0: 'Wilderness',
  1: 'Expedition',
  2: 'Encampment',
  3: 'Village',
  4: 'Town',
  5: 'City',
  6: 'Metropolis',
};

// Node type configuration
export const NODE_TYPE_CONFIG: Record<NodeType, { label: string; icon: string; color: string }> = {
  divine: { label: 'Divine', icon: '✨', color: 'text-yellow-400' },
  economic: { label: 'Economic', icon: '💰', color: 'text-green-400' },
  military: { label: 'Military', icon: '⚔️', color: 'text-red-400' },
  scientific: { label: 'Scientific', icon: '🔬', color: 'text-blue-400' },
};

// Node citizenship interface
export interface NodeCitizenship {
  id: string;
  character_id: string;
  node_name: string;
  node_type: NodeType;
  node_stage: NodeStage;
  region?: string;
  is_mayor: boolean;
  is_council_member: boolean;
  became_citizen_at: string;
  updated_at: string;
}

// Character with citizenship
export interface CharacterWithCitizenship extends CharacterWithProfessions {
  citizenship?: NodeCitizenship;
}

// Node distribution stats (from the SQL view)
export interface NodeDistribution {
  clan_id: string;
  node_name: string;
  node_type: NodeType;
  node_stage: NodeStage;
  citizen_count: number;
  has_mayor: boolean;
  citizen_names: string[];
}

// ============================================================
// SIEGE TYPES
// ============================================================

// Siege event types
export type SiegeType = 'castle_attack' | 'castle_defense' | 'node_attack' | 'node_defense';

// Siege roles (different from party roles - more specialized for large battles)
export type SiegeRole = 'frontline' | 'ranged' | 'healer' | 'siege_operator' | 'scout' | 'reserve';

// Roster status
export type RosterStatus = 'signed_up' | 'confirmed' | 'checked_in' | 'no_show';

// Siege result
export type SiegeResult = 'victory' | 'defeat' | 'draw' | null;

// Siege type configuration
export const SIEGE_TYPE_CONFIG: Record<SiegeType, { label: string; icon: string; color: string; isDefense: boolean }> = {
  castle_attack: { label: 'Castle Attack', icon: '🏰', color: 'text-red-400', isDefense: false },
  castle_defense: { label: 'Castle Defense', icon: '🛡️', color: 'text-blue-400', isDefense: true },
  node_attack: { label: 'Node Attack', icon: '⚔️', color: 'text-orange-400', isDefense: false },
  node_defense: { label: 'Node Defense', icon: '🏛️', color: 'text-green-400', isDefense: true },
};

// Siege role configuration
export const SIEGE_ROLE_CONFIG: Record<SiegeRole, { label: string; icon: string; color: string; description: string }> = {
  frontline: { label: 'Frontline', icon: '🗡️', color: 'text-red-400', description: 'Melee fighters and tanks' },
  ranged: { label: 'Ranged', icon: '🏹', color: 'text-orange-400', description: 'Archers and mages' },
  healer: { label: 'Healer', icon: '💚', color: 'text-green-400', description: 'Healers and support' },
  siege_operator: { label: 'Siege Operator', icon: '🎯', color: 'text-purple-400', description: 'Trebuchets, rams' },
  scout: { label: 'Scout', icon: '👁️', color: 'text-cyan-400', description: 'Reconnaissance' },
  reserve: { label: 'Reserve', icon: '⏳', color: 'text-slate-400', description: 'Backup players' },
};

// Siege event interface
export interface SiegeEvent {
  id: string;
  clan_id: string;
  title: string;
  description?: string;
  siege_type: SiegeType;
  target_name: string;
  starts_at: string;
  declaration_ends_at?: string;
  max_participants: number;
  frontline_needed: number;
  ranged_needed: number;
  healer_needed: number;
  siege_operator_needed: number;
  scout_needed: number;
  reserve_needed: number;
  is_cancelled: boolean;
  result: SiegeResult;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Siege roster entry
export interface SiegeRoster {
  id: string;
  siege_id: string;
  character_id: string;
  user_id?: string;
  role: SiegeRole;
  is_leader: boolean;
  priority: number;
  status: RosterStatus;
  signed_up_at: string;
  confirmed_at?: string;
  checked_in_at?: string;
  note?: string;
}

// Roster with character data
export interface SiegeRosterWithCharacter extends SiegeRoster {
  character?: CharacterWithProfessions;
}

// Siege event with roster
export interface SiegeEventWithRoster extends SiegeEvent {
  roster: SiegeRosterWithCharacter[];
}

// Roster counts by role (from view)
export interface SiegeRosterCounts {
  siege_id: string;
  role: SiegeRole;
  total_count: number;
  confirmed_count: number;
  checked_in_count: number;
}
