import professions from './professions.json';
import races from './races.json';
import itemRarities from './itemRarities.json';

export const AOC_CONFIG = {
  id: 'aoc',
  name: 'Ashes of Creation',
  description: 'Guild profession planning and coordination',
  icon: '⚔️',
  features: {
    professions: true,
    characters: true,
    guilds: true,
    economy: true,
    events: true,
    alliances: true,
  },
  data: {
    professions,
    races,
    itemRarities,
  },
} as const;

export type AOCConfig = typeof AOC_CONFIG;
