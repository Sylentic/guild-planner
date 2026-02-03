'use client';

import { useState } from 'react';
import { X, Sword, Star, Ship, Truck } from 'lucide-react';
import { Race, Archetype } from '@/lib/types';
import { 
  RACES, 
  ARCHETYPES, 
  PARENT_RACES, 
  getClassName,
  MAX_LEVEL,
  SECONDARY_ARCHETYPE_LEVEL,
  RaceId,
  ArchetypeId
} from '@/lib/characters';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGameConfig } from '@/config';
import ShipSelector from './ShipSelector';

interface CharacterFormData {
  name: string;
  race: Race | null;
  primary_archetype: Archetype | null;
  secondary_archetype: Archetype | null;
  level: number;
  is_main: boolean;
  preferred_role?: string | null;
  rank?: string | null;
  ships?: Array<{
    ship_id: string;
    ownership_type: 'owned-pledge' | 'owned-auec' | 'concept-pledge' | 'loaner';
    notes?: string;
  }>;
  vehicles?: Array<{
    ship_id: string;
    ownership_type: 'owned-pledge' | 'owned-auec' | 'concept-pledge' | 'loaner';
    notes?: string;
  }>;
}

interface CharacterFormProps {
  initialData?: Partial<CharacterFormData>;
  onSubmit: (data: CharacterFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  gameSlug?: string;
}

export function CharacterForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEditing = false,
  gameSlug = 'aoc'
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: initialData?.name || '',
    race: initialData?.race || null,
    primary_archetype: initialData?.primary_archetype || null,
    secondary_archetype: initialData?.secondary_archetype || null,
    level: initialData?.level || 1,
    is_main: initialData?.is_main || false,
    preferred_role: initialData?.preferred_role || null,
    rank: initialData?.rank || null,
    ships: initialData?.ships || [],
    vehicles: initialData?.vehicles || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShipsSection, setShowShipsSection] = useState(false);
  const [showVehiclesSection, setShowVehiclesSection] = useState(false);
  const { t } = useLanguage();

  const isAoC = gameSlug === 'aoc';
  const isStarCitizen = gameSlug === 'star-citizen';
  const gameConfig = getGameConfig(gameSlug);
  const gameRoles = (gameConfig as any)?.roles || [];
  const gameRanks = (gameConfig as any)?.ranks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (isAoC && (!formData.race || !formData.primary_archetype)) {
      setError('Race and Primary Archetype are required for Ashes of Creation');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save character');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canHaveSecondary = formData.level >= SECONDARY_ARCHETYPE_LEVEL;
  const className = formData.primary_archetype 
    ? getClassName(formData.primary_archetype as ArchetypeId, formData.secondary_archetype as ArchetypeId | null)
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 pb-24">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sword className="w-5 h-5 text-orange-400" />
            {isEditing ? 'Edit Character' : 'Create Character'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label htmlFor="character-name" className="block text-sm font-medium text-slate-300 mb-2">
              Character Name *
            </label>
            <input
              id="character-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter character name"
              autoFocus
            />
          </div>

          {isAoC && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Race *</label>
                <div className="space-y-3">
                  {Object.entries(PARENT_RACES).map(([parentRace, races]) => (
                    <div key={parentRace}>
                      <div className="text-xs text-slate-500 mb-1">{parentRace}</div>
                      <div className="flex flex-wrap gap-2">
                        {races.map((raceId) => {
                          const race = RACES[raceId as RaceId];
                          const isSelected = formData.race === raceId;
                          return (
                            <button
                              key={raceId}
                              type="button"
                              onClick={() => setFormData({ ...formData, race: raceId as Race })}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                              style={isSelected ? { backgroundColor: race.color } : undefined}
                            >
                              {race.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Archetype *</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(ARCHETYPES).map(([id, archetype]) => {
                    const isSelected = formData.primary_archetype === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          primary_archetype: id as Archetype,
                          secondary_archetype: formData.secondary_archetype === id ? null : formData.secondary_archetype
                        })}
                        className={`flex flex-col items-center p-2 rounded-lg text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={isSelected ? { backgroundColor: archetype.color + '30' } : undefined}
                      >
                        <span className="text-lg">{archetype.icon}</span>
                        <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                          {archetype.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  Secondary Archetype
                  <span className="text-xs text-slate-500">(Unlocks at level {SECONDARY_ARCHETYPE_LEVEL})</span>
                </label>
                <div className={`grid grid-cols-4 gap-2 ${!canHaveSecondary ? 'opacity-50' : ''}`}>
                  {Object.entries(ARCHETYPES).map(([id, archetype]) => {
                    const isSelected = formData.secondary_archetype === id;
                    const isDisabled = !canHaveSecondary || id === formData.primary_archetype;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setFormData({ 
                          ...formData, 
                          secondary_archetype: isSelected ? null : id as Archetype 
                        })}
                        className={`flex flex-col items-center p-2 rounded-lg text-sm transition-all ${
                          isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={isSelected ? { backgroundColor: archetype.color + '30' } : undefined}
                      >
                        <span className="text-lg">{archetype.icon}</span>
                        <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                          {archetype.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {className && (
                  <div className="mt-2 text-sm text-slate-400">
                    Class: <span className="text-orange-400 font-medium">{className}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max={MAX_LEVEL}
                    value={formData.level}
                    onChange={(e) => {
                      const level = parseInt(e.target.value);
                      setFormData({ 
                        ...formData, 
                        level,
                        secondary_archetype: level < SECONDARY_ARCHETYPE_LEVEL ? null : formData.secondary_archetype
                      });
                    }}
                    className="flex-1 accent-orange-500 cursor-pointer"
                    title={t('character.level')}
                  />
                  <span className="w-12 text-center text-white font-medium bg-slate-800 rounded px-2 py-1">
                    {formData.level}
                  </span>
                </div>
              </div>
            </>
          )}

          {!isAoC && gameRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Role</label>
              <select
                value={formData.preferred_role || ''}
                onChange={(e) => setFormData({ ...formData, preferred_role: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a role...</option>
                {gameRoles.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isAoC && gameRanks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Guild Rank</label>
              <select
                value={formData.rank || ''}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a rank...</option>
                {gameRanks.map((rank: any) => (
                  <option key={rank.id} value={rank.id}>
                    {rank.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isStarCitizen && (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => setShowVehiclesSection(!showVehiclesSection)}
                  className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-white">Ground Vehicles</span>
                    {formData.vehicles && formData.vehicles.length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                        {formData.vehicles.length}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">{showVehiclesSection ? '−' : '+'}</span>
                </button>
                
                {showVehiclesSection && (
                  <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <ShipSelector
                      selectedShips={formData.vehicles || []}
                      onChange={(vehicles) => setFormData({ ...formData, vehicles })}
                      includeVehicles={true}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_main: !formData.is_main })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                formData.is_main
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
              }`}
            >
              <Star size={18} className={formData.is_main ? 'fill-amber-400' : ''} />
              Main Character
            </button>
            <p className="text-xs text-slate-500">
              Characters with the same login are automatically linked
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

