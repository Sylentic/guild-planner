import ships from './ships.json';
import roles from './roles.json';

export const STARCITIZEN_CONFIG = {
  id: 'starcitizen',
  name: 'Star Citizen',
  description: 'Fleet management and pilot coordination',
  icon: '🚀',
  features: {
    ships: true,
    pilots: true,
    orgs: true,
    equipment: true,
    missions: true,
    logistics: true,
  },
  data: {
    ships,
    roles,
  },
} as const;

export type StarctizenConfig = typeof STARCITIZEN_CONFIG;
