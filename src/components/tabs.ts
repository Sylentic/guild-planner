// Centralized Tab type and tab list for type safety and consistency

export const TAB_LIST = [
  'characters',
  'events',
  'parties',
  'matrix',
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
  'star-citizen': ['matrix', 'economy', 'achievements', 'alliances', 'builds', 'parties', 'siege'],
};
