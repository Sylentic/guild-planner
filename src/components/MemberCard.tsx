'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { MemberWithProfessions, RankLevel, RANK_COLORS } from '@/lib/types';
import { getRankSummary, checkRankLimits, PROFESSIONS_BY_TIER, TIER_CONFIG } from '@/lib/professions';
import { ProfessionSelector } from './ProfessionSelector';

interface MemberCardProps {
  member: MemberWithProfessions;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetProfessionRank: (memberId: string, professionId: string, rank: RankLevel | null) => Promise<void>;
}

export function MemberCard({ member, onUpdate, onDelete, onSetProfessionRank }: MemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const warnings = checkRankLimits(member.professions);
  const summary = getRankSummary(member.professions);

  // Get highest rank for border color
  const highestRank = member.professions.length > 0 
    ? (Math.max(...member.professions.map(p => p.rank)) as RankLevel)
    : 0;
  const borderColor = highestRank > 0 ? RANK_COLORS[highestRank as RankLevel].border : 'border-slate-700';
  const glowEffect = highestRank === 4 ? `shadow-lg ${RANK_COLORS[4].glow}` : '';

  const handleSave = async () => {
    if (editName.trim() && editName !== member.name) {
      await onUpdate(member.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(member.id);
    setIsDeleting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(member.name);
      setIsEditing(false);
    }
  };

  // Get profession rank for a member
  const getProfessionRank = (professionId: string): RankLevel | null => {
    const prof = member.professions.find((p) => p.profession === professionId);
    return prof ? prof.rank : null;
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
          {/* Name */}
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
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditName(member.name);
                    setIsEditing(false);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3 className="text-white font-semibold truncate">{member.name}</h3>
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
            {!isEditing && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Edit2 size={16} />
                </button>
                {isDeleting ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
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
                    onChange={(rank) => onSetProfessionRank(member.id, profession.id, rank)}
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
