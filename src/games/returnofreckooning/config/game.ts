import { GameConfig } from '@/lib/games';

export const ROR_CONFIG: GameConfig = {
  id: 'ror',
  name: 'Return of Reckoning',
  description: 'Warband coordination and RvR event planning',
  icon: '⚔️',
  iconUrl: '/images/games/ror-icon.svg',
  features: {
    characters: true,
    events: true,
    parties: true,
    alliances: true,
    professions: false,
    economy: false,
    achievements: false,
    siege: false,
    ships: false,
    matrix: false,
  },
};
