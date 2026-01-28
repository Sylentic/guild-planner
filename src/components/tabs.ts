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
