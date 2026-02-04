// =====================================================
// AoC Character Data - Races, Archetypes, Classes
// =====================================================

// Races grouped by parent race
export const PARENT_RACES = {
  'Aela Human': ['kaelar', 'vaelune'],
  'Dünzenkell Dwarf': ['dunir', 'nikua'],
  'Pyrian Elf': ['empyrean', 'pyrai'],
  'Kaivek Orc': ['renkai', 'vek'],
  'Tulnar': ['tulnar'],
} as const;

export const RACES = {
  kaelar: { 
    name: 'Kaelar', 
    parentRace: 'Aela Human', 
    description: 'Empire builders, valuing order and strength',
    color: '#c4a35a' 
  },
  vaelune: { 
    name: 'Vaelune', 
    parentRace: 'Aela Human', 
    description: 'Traders and diplomats, masters of commerce',
    color: '#7a9eb8' 
  },
  dunir: { 
    name: 'Dünir', 
    parentRace: 'Dünzenkell Dwarf', 
    description: 'Traditional mountain dwarves, master craftsmen',
    color: '#a67c52' 
  },
  nikua: { 
    name: 'Nikua', 
    parentRace: 'Dünzenkell Dwarf', 
    description: 'Island-dwelling dwarves, seafarers and explorers',
    color: '#4a9eb8' 
  },
  empyrean: { 
    name: 'Empyrean', 
    parentRace: 'Pyrian Elf', 
    description: 'High elves of imperial heritage, arcane masters',
    color: '#d4af37' 
  },
  pyrai: { 
    name: "Py'Rai", 
    parentRace: 'Pyrian Elf', 
    description: 'Wood elves, guardians of nature',
    color: '#228b22' 
  },
  renkai: { 
    name: "Ren'Kai", 
    parentRace: 'Kaivek Orc', 
    description: 'Honour-bound warriors, masters of martial arts',
    color: '#8b0000' 
  },
  vek: { 
    name: 'Vek', 
    parentRace: 'Kaivek Orc', 
    description: 'Mystical orcs, shamanistic traditions',
    color: '#4b0082' 
  },
  tulnar: { 
    name: 'Tulnar', 
    parentRace: 'Tulnar', 
    description: 'Underground dwellers, diverse and adaptable',
    color: '#2f4f4f' 
  },
} as const;

export type RaceId = keyof typeof RACES;

// Primary Archetypes (chosen at character creation)
export const ARCHETYPES = {
  tank: { 
    name: 'Tank', 
    description: 'Absorb damage and protect allies',
    color: '#3b82f6',  // blue
    icon: '🛡️'
  },
  cleric: { 
    name: 'Cleric', 
    description: 'Heal and support your party',
    color: '#eab308',  // yellow
    icon: '✨'
  },
  mage: { 
    name: 'Mage', 
    description: 'Wield powerful elemental magic',
    color: '#8b5cf6',  // purple
    icon: '🔮'
  },
  fighter: { 
    name: 'Fighter', 
    description: 'Master of weapons and combat',
    color: '#ef4444',  // red
    icon: '⚔️'
  },
  ranger: { 
    name: 'Ranger', 
    description: 'Ranged combat and nature skills',
    color: '#22c55e',  // green
    icon: '🏹'
  },
  bard: { 
    name: 'Bard', 
    description: 'Buff allies and debuff enemies',
    color: '#ec4899',  // pink
    icon: '🎵'
  },
  rogue: { 
    name: 'Rogue', 
    description: 'Stealth and burst damage',
    color: '#6b7280',  // gray
    icon: '🗡️'
  },
  summoner: { 
    name: 'Summoner', 
    description: 'Command magical creatures',
    color: '#06b6d4',  // cyan
    icon: '👻'
  },
} as const;

export type ArchetypeId = keyof typeof ARCHETYPES;

// Class names: CLASS_NAMES[primary][secondary] = className
// Based on official AoC class combinations
export const CLASS_NAMES: Record<ArchetypeId, Record<ArchetypeId, string>> = {
  fighter: {
    fighter: 'Weapon Master',
    tank: 'Knight',
    rogue: 'Shadowblade',
    ranger: 'Strider',
    mage: 'Spellsword',
    cleric: 'Highsword',
    summoner: 'Bladecaller',
    bard: 'Bladedancer',
  },
  tank: {
    tank: 'Guardian',
    fighter: 'Dreadnought',
    rogue: 'Nightshield',
    ranger: 'Warden',
    mage: 'Spellshield',
    cleric: 'Paladin',
    summoner: 'Keeper',
    bard: 'Argent',
  },
  rogue: {
    rogue: 'Assassin',
    fighter: 'Duelist',
    tank: 'Nightshield',
    ranger: 'Predator',
    mage: 'Nightspell',
    cleric: 'Cultist',
    summoner: 'Shadow Lord',
    bard: 'Charlatan',
  },
  ranger: {
    ranger: 'Hawkeye',
    fighter: 'Hunter',
    tank: 'Sentinel',
    rogue: 'Scout',
    mage: 'Scion',
    cleric: 'Protector',
    summoner: 'Falconer',
    bard: 'Bowsinger',
  },
  mage: {
    mage: 'Archwizard',
    fighter: 'Battlemage',
    tank: 'Spellstone',
    rogue: 'Shadow Caster',
    ranger: 'Spellhunter',
    cleric: 'Acolyte',
    summoner: 'Warlock',
    bard: 'Sorcerer',
  },
  cleric: {
    cleric: 'High Priest',
    fighter: 'Templar',
    tank: 'Apostle',
    rogue: 'Shadow Disciple',
    ranger: 'Soul Warden',
    mage: 'Oracle',
    summoner: 'Shaman',
    bard: 'Scryer',
  },
  summoner: {
    summoner: 'Conjurer',
    fighter: 'Wild Blade',
    tank: 'Brood Warden',
    rogue: 'Shadowmancer',
    ranger: 'Beastmaster',
    mage: 'Spellmancer',
    cleric: 'Necromancer',
    bard: 'Enchanter',
  },
  bard: {
    bard: 'Minstrel',
    fighter: 'Tellsword',
    tank: 'Siren',
    rogue: 'Trickster',
    ranger: 'Song Warden',
    mage: 'Magician',
    cleric: 'Song Caller',
    summoner: 'Soul Weaver',
  },
};

/**
 * Get the class name for a primary/secondary archetype combination
 */
export function getClassName(primary: ArchetypeId, secondary: ArchetypeId | null): string {
  if (!secondary) {
    return ARCHETYPES[primary].name;
  }
  return CLASS_NAMES[primary][secondary] || `${ARCHETYPES[primary].name}/${ARCHETYPES[secondary].name}`;
}

/**
 * Get race display info
 */
export function getRaceInfo(raceId: RaceId) {
  return RACES[raceId];
}

/**
 * Get archetype display info
 */
export function getArchetypeInfo(archetypeId: ArchetypeId) {
  return ARCHETYPES[archetypeId];
}

// Level constants
export const MAX_LEVEL = 50;
export const SECONDARY_ARCHETYPE_LEVEL = 25;

