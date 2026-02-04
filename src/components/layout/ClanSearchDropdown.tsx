'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface Clan {
  id: string;
  name: string;
  slug: string;
}

interface ClanSearchDropdownProps {
  onSelect: (clan: Clan) => void;
  excludeClanIds?: string[];
  placeholder?: string;
  selectedClans?: Clan[];
  multiple?: boolean;
  onRemove?: (groupId: string) => void;
}

/**
 * Searchable dropdown for finding and selecting clans
 */
export function ClanSearchDropdown({
  onSelect,
  excludeClanIds = [],
  placeholder,
  selectedClans = [],
  multiple = false,
  onRemove,
}: ClanSearchDropdownProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Clan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search for clans
  useEffect(() => {
    const searchClans = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, slug')
          .ilike('name', `%${query}%`)
          .limit(10);

        if (error) throw error;

        // Filter out excluded clans
        const filtered = (data || []).filter(
          c => !excludeClanIds.includes(c.id) && !selectedClans.some(s => s.id === c.id)
        );
        setResults(filtered);
      } catch (err) {
        console.error('Error searching clans:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchClans, 300);
    return () => clearTimeout(debounce);
  }, [query, excludeClanIds, selectedClans]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (clan: Clan) => {
    onSelect(clan);
    setQuery('');
    setResults([]);
    if (!multiple) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected Clans (for multiple mode) */}
      {multiple && selectedClans.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedClans.map(clan => (
            <span
              key={clan.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm"
            >
              <Users className="w-3 h-3" />
              {clan.name}
              {onRemove && (
                <button
                  onClick={() => onRemove(clan.id)}
                  className="p-0.5 hover:bg-purple-500/30 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t('alliance.searchClan')}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-500 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              {isLoading ? t('common.loading') : t('alliance.noClanResults')}
            </div>
          ) : (
            results.map(clan => (
              <button
                key={clan.id}
                onClick={() => handleSelect(clan)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="text-white font-medium">{clan.name}</div>
                  <div className="text-xs text-slate-500">/{clan.slug}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

