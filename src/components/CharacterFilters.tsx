'use client';

import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { RACES, ARCHETYPES, RaceId, ArchetypeId } from '@/lib/characters';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CharacterFilters {
  search: string;
  race: RaceId | '';
  archetype: ArchetypeId | '';
  minLevel: number;
  maxLevel: number;
  hasProfessions: boolean | null; // null = any, true = has some, false = none
}

interface CharacterFiltersProps {
  filters: CharacterFilters;
  onChange: (filters: CharacterFilters) => void;
  characterCount: number;
  filteredCount: number;
  gameSlug?: string;
}

export const DEFAULT_FILTERS: CharacterFilters = {
  search: '',
  race: '',
  archetype: '',
  minLevel: 1,
  maxLevel: 50,
  hasProfessions: null,
};

export function CharacterFiltersBar({
  filters,
  onChange,
  characterCount,
  filteredCount,
  gameSlug = 'aoc',
}: CharacterFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  
  const hasActiveFilters = 
    filters.search !== '' || 
    filters.race !== '' || 
    filters.archetype !== '' || 
    filters.minLevel > 1 || 
    filters.maxLevel < 50 ||
    filters.hasProfessions !== null;

  const clearFilters = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4 space-y-3">
      {/* Main search row */}
      <div className="flex gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder={t('character.searchPlaceholder')}
            aria-label={t('character.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
              title={t('common.clear')}
              aria-label={t('common.clear')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Expand filters button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
            hasActiveFilters 
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="text-xs bg-orange-500 text-white px-1.5 rounded-full">!</span>
          )}
          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          {/* Race filter - AoC only */}
          {gameSlug === 'aoc' && (
            <div>
              <label htmlFor="filter-race" className="text-xs text-slate-400 mb-1 block">{t('filters.race')}</label>
              <select
                id="filter-race"
                value={filters.race}
                onChange={(e) => onChange({ ...filters, race: e.target.value as RaceId | '' })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{t('filters.allRaces')}</option>
                {Object.entries(RACES).map(([id, race]) => (
                  <option key={id} value={id}>{race.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Archetype filter - AoC only */}
          {gameSlug === 'aoc' && (
            <div>
              <label htmlFor="filter-archetype" className="text-xs text-slate-400 mb-1 block">{t('filters.class')}</label>
              <select
                id="filter-archetype"
                value={filters.archetype}
                onChange={(e) => onChange({ ...filters, archetype: e.target.value as ArchetypeId | '' })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{t('filters.allArchetypes')}</option>
                {Object.entries(ARCHETYPES).map(([id, arch]) => (
                  <option key={id} value={id}>{arch.icon} {arch.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Level range - AoC only */}
          {gameSlug === 'aoc' && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t('filters.levelRange')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={filters.minLevel}
                  onChange={(e) => onChange({ ...filters, minLevel: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={t('filters.minLevel')}
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={filters.maxLevel}
                  onChange={(e) => onChange({ ...filters, maxLevel: parseInt(e.target.value) || 50 })}
                  className="w-16 px-2 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={t('filters.maxLevel')}
                />
              </div>
            </div>
          )}

          {/* Professions filter - AoC only */}
          {gameSlug === 'aoc' && (
            <div>
              <label htmlFor="filter-professions" className="text-xs text-slate-400 mb-1 block">{t('filters.professions')}</label>
              <select
                id="filter-professions"
                value={filters.hasProfessions === null ? '' : filters.hasProfessions ? 'yes' : 'no'}
                onChange={(e) => onChange({ 
                  ...filters, 
                  hasProfessions: e.target.value === '' ? null : e.target.value === 'yes' 
                })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{t('common.all')}</option>
                <option value="yes">{t('filters.hasProfessions')}</option>
                <option value="no">{t('filters.noProfessions')}</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Results count and clear */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {t('filters.showing')} <span className="text-white font-medium">{filteredCount}</span>
          {filteredCount !== characterCount && (
            <span> {t('filters.of')} {characterCount}</span>
          )} {t('filters.characters')}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
          >
            <X size={14} />
            {t('filters.clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to filter characters
export function filterCharacters<T extends { 
  name: string; 
  race?: string | null; 
  primary_archetype?: string | null;
  level?: number;
  professions: unknown[];
  user_id?: string | null;
  is_main?: boolean;
}>(
  characters: T[],
  filters: CharacterFilters
): T[] {
  // If there's a search term, we need to include related characters
  let matchedUserIds = new Set<string>();
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    characters.forEach(char => {
      if (char.name.toLowerCase().includes(searchLower) && char.user_id) {
        matchedUserIds.add(char.user_id);
      }
    });
  }
  
  return characters.filter(char => {
    // Search filter - include character if:
    // 1. Name matches search, OR
    // 2. Has user_id and that user_id had a character that matched search
    if (filters.search) {
      const nameMatches = char.name.toLowerCase().includes(filters.search.toLowerCase());
      const relatedMatches = char.user_id && matchedUserIds.has(char.user_id);
      
      if (!nameMatches && !relatedMatches) {
        return false;
      }
    }

    // Race filter
    if (filters.race && char.race !== filters.race) {
      return false;
    }

    // Archetype filter
    if (filters.archetype && char.primary_archetype !== filters.archetype) {
      return false;
    }

    // Level filter
    const level = char.level || 1;
    if (level < filters.minLevel || level > filters.maxLevel) {
      return false;
    }

    // Professions filter
    if (filters.hasProfessions !== null) {
      const hasSome = char.professions.length > 0;
      if (filters.hasProfessions !== hasSome) {
        return false;
      }
    }

    return true;
  });
}

