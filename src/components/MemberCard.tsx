'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, Check, X, AlertTriangle, Star } from 'lucide-react';
import { CharacterWithProfessions, RankLevel, RANK_COLORS } from '@/lib/types';
import { getRankSummary, checkRankLimits, PROFESSIONS_BY_TIER, TIER_CONFIG } from '@/lib/professions';
import { RACES, ARCHETYPES, getClassName, RaceId, ArchetypeId } from '@/lib/characters';
import { ProfessionSelector } from './ProfessionSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface CharacterCardProps {
  character: CharacterWithProfessions;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetProfessionRank: (characterId: string, professionId: string, rank: RankLevel | null, level?: number, quality?: number) => Promise<void>;
  onEdit?: (character: CharacterWithProfessions) => void;
  readOnly?: boolean;
  mainCharacterName?: string; // Name of the main character this alt belongs to
  altCharacters?: Array<{ id: string; name: string }>; // List of alts for this main character
}

export function CharacterCard({ 
  character, 
  onUpdate, 
  onDelete, 
  onSetProfessionRank, 
  onEdit,
  readOnly = false,
  mainCharacterName,
  altCharacters = []
}: CharacterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(character.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();

  const warnings = checkRankLimits(character.professions);
  const summary = getRankSummary(character.professions);

  // Get highest rank for border color
  const highestRank = character.professions.length > 0 
    ? (Math.max(...character.professions.map(p => p.rank)) as RankLevel)
    : 0;
  const borderColor = highestRank > 0 ? RANK_COLORS[highestRank as RankLevel].border : 'border-slate-700';
  const glowEffect = highestRank === 4 ? `shadow-lg ${RANK_COLORS[4].glow}` : '';

  // Get race and class info
  const raceInfo = character.race ? RACES[character.race as RaceId] : null;
  const primaryInfo = character.primary_archetype ? ARCHETYPES[character.primary_archetype as ArchetypeId] : null;
  const className = character.primary_archetype 
    ? getClassName(character.primary_archetype as ArchetypeId, character.secondary_archetype as ArchetypeId | null)
    : null;

  const handleSave = async () => {
    if (editName.trim() && editName !== character.name) {
      await onUpdate(character.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(character.id);
    setIsDeleting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(character.name);
      setIsEditing(false);
    }
  };

  // Get profession rank for a character
  const getProfessionRank = (professionId: string): RankLevel | null => {
    const prof = character.professions.find((p) => p.profession === professionId);
    return prof ? prof.rank : null;
  };

  // Get profession level for a character
  const getProfessionLevel = (professionId: string): number => {
    const prof = character.professions.find((p) => p.profession === professionId);
    return prof ? prof.artisan_level : 0;
  };

  // Get profession quality for a character
  const getProfessionQuality = (professionId: string): number => {
    const prof = character.professions.find((p) => p.profession === professionId);
    return prof ? prof.quality_score : 0;
  };

  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-sm rounded-lg border ${borderColor} ${glowEffect} transition-all duration-300 hover:border-slate-600`}
    >
      {/* Header - clickable to expand/collapse */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Name and Character Info */}
          <div className="flex-1 min-w-0" onClick={(e) => isEditing && e.stopPropagation()}>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full max-w-[200px]"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  title={t('character.name')}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                  title={t('common.save')}
                  aria-label={t('common.save')}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditName(character.name);
                    setIsEditing(false);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title={t('common.cancel')}
                  aria-label={t('common.cancel')}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  {character.is_main && (
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                  )}
                  <h3 className="text-white font-semibold truncate">{character.name}</h3>
                  {character.level > 1 && (
                    <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      Lv.{character.level}
                    </span>
                  )}
                </div>
                {/* Race and Class info */}
                <div className="flex items-center gap-2 mt-0.5 text-sm">
                  {raceInfo && (
                    <span className="text-slate-400">{raceInfo.name}</span>
                  )}
                  {className && (
                    <>
                      {raceInfo && <span className="text-slate-600">•</span>}
                      <span style={{ color: primaryInfo?.color }}>{className}</span>
                    </>
                  )}
                </div>
                {/* Main/Alt relationship */}
                {mainCharacterName && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <span>Alt of</span>
                    <span className="text-amber-400">{mainCharacterName}</span>
                  </div>
                )}
                {altCharacters.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <span>Alts:</span>
                    <span className="text-slate-400">{altCharacters.map(a => a.name).join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-slate-400 hidden sm:inline">{summary}</span>

            {/* Warning indicator */}
            {warnings.length > 0 && (
              <div className="relative group">
                <AlertTriangle size={16} className="text-yellow-500" />
                <div className="absolute right-0 top-6 bg-slate-800 border border-slate-600 rounded p-2 text-xs text-yellow-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {warnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions - stop propagation to prevent toggle */}
            {!isEditing && !readOnly && (
              <>
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(character); }}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={t('character.editDetails')}
                    aria-label={t('character.editDetails')}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {isDeleting ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title={t('common.confirmDelete')}
                      aria-label={t('common.confirmDelete')}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title={t('common.cancelDelete')}
                      aria-label={t('common.cancelDelete')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}

            {/* Expand indicator */}
            <div className="p-1 text-slate-400">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* Mobile summary */}
        <div className="sm:hidden mt-2 text-sm text-slate-400">{summary}</div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {(['gathering', 'processing', 'crafting'] as const).map((tier) => (
            <div key={tier}>
              <h4 className={`text-sm font-medium ${TIER_CONFIG[tier].color} mb-2 flex items-center gap-2`}>
                <span>{TIER_CONFIG[tier].icon}</span>
                {TIER_CONFIG[tier].label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PROFESSIONS_BY_TIER[tier].map((profession) => (
                  <ProfessionSelector
                    key={profession.id}
                    profession={profession}
                    currentRank={getProfessionRank(profession.id)}
                    currentLevel={getProfessionLevel(profession.id)}
                    currentQuality={getProfessionQuality(profession.id)}
                    onChange={(rank: RankLevel | null, level?: number, quality?: number) => 
                      onSetProfessionRank(character.id, profession.id, rank, level, quality)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Legacy alias for backward compatibility
export { CharacterCard as MemberCard };
