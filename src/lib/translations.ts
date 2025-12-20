// Translation helpers for game terms
// Use these to translate archetypes, races, professions, etc.

import { useLanguage } from '@/contexts/LanguageContext';

// Key mapping for game terms
const ARCHETYPE_KEYS: Record<string, string> = {
  fighter: 'archetypes.fighter',
  tank: 'archetypes.tank',
  rogue: 'archetypes.rogue',
  ranger: 'archetypes.ranger',
  mage: 'archetypes.mage',
  summoner: 'archetypes.summoner',
  cleric: 'archetypes.cleric',
  bard: 'archetypes.bard',
};

const RACE_KEYS: Record<string, string> = {
  kaelar: 'races.kaelar',
  vaelune: 'races.vaelune',
  empyrean: 'races.empyrean',
  pyrai: 'races.pyrai',
  renkai: 'races.renkai',
  vek: 'races.vek',
  dunir: 'races.dunir',
  nikua: 'races.nikua',
  tulnar: 'races.tulnar',
};

const PROFESSION_KEYS: Record<string, string> = {
  mining: 'professions.mining',
  herbalism: 'professions.herbalism',
  lumberjacking: 'professions.lumberjacking',
  fishing: 'professions.fishing',
  hunting: 'professions.hunting',
  animal_husbandry: 'professions.animalHusbandry',
  farming: 'professions.farming',
  metalworking: 'professions.metalworking',
  stonemasonry: 'professions.stonemasonry',
  woodworking: 'professions.woodworking',
  weaving: 'professions.weaving',
  tanning: 'professions.tanning',
  alchemy: 'professions.alchemy',
  cooking: 'professions.cooking',
  weaponsmithing: 'professions.weaponsmithing',
  armorsmithing: 'professions.armorsmithing',
  leatherworking: 'professions.leatherworking',
  tailoring: 'professions.tailoring',
  jewelcrafting: 'professions.jewelcrafting',
  arcane_engineering: 'professions.arcaneEngineering',
  carpentry: 'professions.carpentry',
  scribe: 'professions.scribe',
};

const RANK_KEYS: Record<number, string> = {
  0: 'character.novice',
  1: 'character.apprentice', 
  2: 'character.journeyman',
  3: 'character.master',
  4: 'character.grandmaster',
};

const PARTY_ROLE_KEYS: Record<string, string> = {
  tank: 'party.tank',
  healer: 'party.healer',
  dps: 'party.dps',
  support: 'party.support',
};

// Custom hook for game term translations
export function useGameTranslations() {
  const { t } = useLanguage();

  return {
    translateArchetype: (id: string): string => {
      const key = ARCHETYPE_KEYS[id.toLowerCase()];
      return key ? t(key) : id;
    },
    translateRace: (id: string): string => {
      const key = RACE_KEYS[id.toLowerCase()];
      return key ? t(key) : id;
    },
    translateProfession: (id: string): string => {
      const key = PROFESSION_KEYS[id.toLowerCase()];
      return key ? t(key) : id;
    },
    translateRank: (rank: number): string => {
      const key = RANK_KEYS[rank];
      return key ? t(key) : `Rank ${rank}`;
    },
    translatePartyRole: (role: string): string => {
      const key = PARTY_ROLE_KEYS[role.toLowerCase()];
      return key ? t(key) : role;
    },
  };
}

// Export keys for direct use
export { ARCHETYPE_KEYS, RACE_KEYS, PROFESSION_KEYS, RANK_KEYS, PARTY_ROLE_KEYS };
