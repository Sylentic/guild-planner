'use client';

import { useState } from 'react';
import { Profession, RankLevel, RANK_NAMES, RANK_COLORS, getMaxLevelForRank, isAtRankCap } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProfessionSelectorProps {
  profession: Profession;
  currentRank: RankLevel | null;
  currentLevel?: number; // 0-50 artisan level
  currentQuality?: number;
  onChange: (rank: RankLevel | null, level?: number, quality?: number) => void;
}

export function ProfessionSelector({ 
  profession, 
  currentRank, 
  currentLevel = 0,
  currentQuality = 0,
  onChange 
}: ProfessionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [level, setLevel] = useState(currentLevel);
  const [quality, setQuality] = useState(currentQuality);
  const ranks: RankLevel[] = [1, 2, 3, 4]; // 1=Apprentice, 2=Journeyman, 3=Master, 4=Grandmaster
  
  // Max level is determined by current certification rank (or 10 if uncertified/Novice)
  const maxLevel = currentRank ? getMaxLevelForRank(currentRank) : 10;
  const atCap = currentRank ? isAtRankCap(level, currentRank) : false;
  const canCertify = atCap && currentRank !== null && currentRank < 4; // Can't go beyond Grandmaster

  const handleRankClick = (rank: RankLevel) => {
    if (currentRank === rank) {
      // If clicking the current rank, remove it
      onChange(null);
      setIsExpanded(false);
    } else {
      // Set new rank and default level for that rank
      // Map rank to minimum level: 1->10, 2->20, 3->30, 4->40
      const defaultLevel = rank === 1 ? 10 : rank === 2 ? 20 : rank === 3 ? 30 : 40;
      setLevel(defaultLevel);
      onChange(rank, defaultLevel, quality);
    }
  };

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    // Keep existing rank - promotion is manual
    if (currentRank) {
      onChange(currentRank, newLevel, quality);
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (currentRank) {
      onChange(currentRank, level, newQuality);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300 truncate flex-1" title={profession.name}>
          {profession.name}
        </div>
        {currentRank && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Show details"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      <div className="flex gap-1">
        {ranks.map((rank) => {
          const isActive = currentRank !== null && currentRank >= rank;
          const isExactRank = currentRank === rank;
          const colors = RANK_COLORS[rank];

          return (
            <button
              key={rank}
              onClick={() => handleRankClick(rank)}
              title={`${RANK_NAMES[rank]}${isExactRank ? ' (click to remove)' : ''}`}
              className={`
                flex-1 py-1 px-1 rounded text-xs font-medium transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border} border`
                    : 'bg-slate-700/50 text-slate-500 border border-transparent hover:border-slate-600'
                }
                ${isExactRank ? 'ring-1 ring-offset-1 ring-offset-slate-800' : ''}
              `}
              style={isExactRank ? { '--tw-ring-color': colors.border.replace('border-', 'rgb(var(--color-') + ')' } as React.CSSProperties : {}}
            >
              {RANK_NAMES[rank][0]}
            </button>
          );
        })}
      </div>
      
      {/* Detailed metrics - shown when expanded */}
      {currentRank && isExpanded && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
          {/* Artisan Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">
                Level
              </label>
              <span className="text-xs text-slate-300 font-medium">
                {level}/{maxLevel}
                {atCap && canCertify && (
                  <span className="text-amber-400 ml-1">⚠ Capped</span>
                )}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxLevel}
              value={level}
              onChange={(e) => handleLevelChange(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              title={`Artisan level: ${level}/${maxLevel}`}
            />
            <div className="flex justify-between text-xs text-slate-600 mt-0.5">
              <span>0</span>
              {maxLevel >= 10 && <span>10</span>}
              {maxLevel >= 20 && <span>20</span>}
              {maxLevel >= 30 && <span>30</span>}
              {maxLevel >= 40 && <span>40</span>}
              {maxLevel >= 50 && <span>50</span>}
            </div>
            {atCap && canCertify && (
              <div className="text-xs text-amber-400 mt-1 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
                🎓 Ready to certify as {RANK_NAMES[(currentRank + 1) as RankLevel]}
              </div>
            )}
          </div>
          
          {/* Quality Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400">
                Quality
              </label>
              <span className="text-xs text-slate-300 font-medium">{quality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              title={`Quality: ${quality}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
