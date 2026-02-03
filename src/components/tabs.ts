// Centralized Tab type and tab list for type safety and consistency

export const TAB_LIST = [
  'characters',
  'events',
  'parties',
  'matrix',
  'fleet',
  'ships',
  'manage',
  'siege',
  'economy',
  'more',
  'achievements',
  'alliances',
  'builds',
] as const;

export type Tab = typeof TAB_LIST[number];

// Tabs to hide for specific games
export const GAME_TAB_EXCLUSIONS: Record<string, Tab[]> = {
  'star-citizen': ['economy', 'achievements', 'alliances', 'builds', 'parties', 'siege'],
};

// Tab icons and purposes for different games
export const GAME_TAB_CUSTOMIZATION: Record<string, Partial<Record<Tab, string>>> = {
  'star-citizen': {
    matrix: 'Ships', // Matrix shows ships for SC
  },
};

