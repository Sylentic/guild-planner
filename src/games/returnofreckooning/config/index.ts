// Return of Reckoning Game Configuration

export const ROR_GAME_CONFIG = {
  id: 'ror',
  name: 'Return of Reckoning',
  description: 'PvP-focused fantasy MMO with faction-based warfare',
  icon: '⚔️',
  slug: 'ror',
};

export const ROR_FACTIONS = {
  order: {
    id: 'order',
    name: 'Order',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  destruction: {
    id: 'destruction',
    name: 'Destruction',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export type RORFaction = keyof typeof ROR_FACTIONS;
export type RORRole = 'tank' | 'melee-dps' | 'skirmish-dps' | 'ranged-dps' | 'healer';

export interface RORClass {
  id: string;
  name: string;
  faction: RORFaction;
  role: RORRole;
}

export const ROR_CLASSES: RORClass[] = [
  // Order - Dwarves
  { id: 'ironbreaker', name: 'Ironbreaker', faction: 'order', role: 'tank' },
  { id: 'slayer', name: 'Slayer', faction: 'order', role: 'melee-dps' },
  { id: 'runepriest', name: 'Runepriest', faction: 'order', role: 'healer' },
  { id: 'engineer', name: 'Engineer', faction: 'order', role: 'ranged-dps' },

  // Order - Humans
  { id: 'knight-blazing-sun', name: 'Knight of the Blazing Sun', faction: 'order', role: 'tank' },
  { id: 'witch-hunter', name: 'Witch Hunter', faction: 'order', role: 'skirmish-dps' },
  { id: 'warrior-priest', name: 'Warrior Priest', faction: 'order', role: 'healer' },
  { id: 'bright-wizard', name: 'Bright Wizard', faction: 'order', role: 'ranged-dps' },

  // Order - High Elves
  { id: 'swordmaster', name: 'Swordmaster', faction: 'order', role: 'tank' },
  { id: 'white-lion', name: 'White Lion', faction: 'order', role: 'melee-dps' },
  { id: 'archmage', name: 'Archmage', faction: 'order', role: 'healer' },
  { id: 'shadow-warrior', name: 'Shadow Warrior', faction: 'order', role: 'skirmish-dps' },

  // Destruction - Orcs
  { id: 'black-orc', name: 'Black Orc', faction: 'destruction', role: 'tank' },
  { id: 'choppa', name: 'Choppa', faction: 'destruction', role: 'melee-dps' },
  { id: 'shaman', name: 'Shaman', faction: 'destruction', role: 'healer' },
  { id: 'squig-herder', name: 'Squig Herder', faction: 'destruction', role: 'ranged-dps' },

  // Destruction - Chaos
  { id: 'chosen', name: 'Chosen', faction: 'destruction', role: 'tank' },
  { id: 'marauder', name: 'Marauder', faction: 'destruction', role: 'melee-dps' },
  { id: 'zealot', name: 'Zealot', faction: 'destruction', role: 'healer' },
  { id: 'magus', name: 'Magus', faction: 'destruction', role: 'ranged-dps' },

  // Destruction - Dark Elves
  { id: 'black-guard', name: 'Black Guard', faction: 'destruction', role: 'tank' },
  { id: 'witch-elf', name: 'Witch Elf', faction: 'destruction', role: 'skirmish-dps' },
  { id: 'disciple-khaine', name: 'Disciple of Khaine', faction: 'destruction', role: 'healer' },
  { id: 'sorceress', name: 'Sorceress', faction: 'destruction', role: 'ranged-dps' },
];

export const ROR_ROLE_CONFIG = {
  'tank': {
    label: 'Tank',
    icon: '🛡️',
    color: 'text-blue-400',
  },
  'melee-dps': {
    label: 'Melee DPS',
    icon: '⚔️',
    color: 'text-orange-400',
  },
  'skirmish-dps': {
    label: 'Skirmish DPS',
    icon: '🗡️',
    color: 'text-yellow-400',
  },
  'ranged-dps': {
    label: 'Ranged DPS',
    icon: '🏹',
    color: 'text-cyan-400',
  },
  'healer': {
    label: 'Healer',
    icon: '✨',
    color: 'text-green-400',
  },
};

// Party composition defaults for RoR: 2 Tank, 2 Healer, 2 DPS (Melee + Skirmish + Ranged combined)
export const ROR_PARTY_DEFAULTS = {
  tank: 2,
  healer: 2,
  dps: 2, // Combined melee-dps + skirmish-dps + ranged-dps
};

export const getClassById = (classId: string): RORClass | undefined => {
  return ROR_CLASSES.find(c => c.id === classId);
};

export const getClassesByFaction = (faction: RORFaction): RORClass[] => {
  return ROR_CLASSES.filter(c => c.faction === faction);
};

export const getClassesByRole = (role: RORRole): RORClass[] => {
  return ROR_CLASSES.filter(c => c.role === role);
};

export const isDPSRole = (role: RORRole): boolean => {
  return role === 'melee-dps' || role === 'skirmish-dps' || role === 'ranged-dps';
};
