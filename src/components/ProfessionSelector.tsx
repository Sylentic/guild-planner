'use client';

import { Profession, RankLevel, RANK_NAMES, RANK_COLORS } from '@/lib/types';

interface ProfessionSelectorProps {
  profession: Profession;
  currentRank: RankLevel | null;
  onChange: (rank: RankLevel | null) => void;
}

export function ProfessionSelector({ profession, currentRank, onChange }: ProfessionSelectorProps) {
  const ranks: RankLevel[] = [1, 2, 3, 4];

  const handleRankClick = (rank: RankLevel) => {
    if (currentRank === rank) {
      // If clicking the current rank, remove it
      onChange(null);
    } else {
      // Set new rank
      onChange(rank);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
      <div className="text-sm text-slate-300 mb-2 truncate" title={profession.name}>
        {profession.name}
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
    </div>
  );
}
