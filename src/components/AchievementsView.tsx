'use client';

import { Trophy, Lock, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClanAchievementWithDefinition, AchievementCategory } from '@/lib/types';

interface AchievementsViewProps {
  achievements: ClanAchievementWithDefinition[];
  unlockedCount: number;
  totalPoints: number;
}

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  guild: 'text-blue-400 border-blue-400/30 bg-blue-500/10',
  pvp: 'text-red-400 border-red-400/30 bg-red-500/10',
  economy: 'text-amber-400 border-amber-400/30 bg-amber-500/10',
  community: 'text-green-400 border-green-400/30 bg-green-500/10',
  milestone: 'text-purple-400 border-purple-400/30 bg-purple-500/10',
};

export function AchievementsView({
  achievements,
  unlockedCount,
  totalPoints,
}: AchievementsViewProps) {
  const { t } = useLanguage();

  const categories: AchievementCategory[] = ['milestone', 'pvp', 'economy', 'community', 'guild'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-500/20 to-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{t('achievements.guildAchievements')}</h2>
            <p className="text-slate-400 text-sm">
              {unlockedCount} / {achievements.length} {t('achievements.unlocked')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{totalPoints}</div>
            <div className="text-xs text-slate-400">{t('achievements.totalPoints')}</div>
          </div>
        </div>
      </div>

      {/* Achievements by Category */}
      {categories.map((category) => {
        const categoryAchievements = achievements.filter(a => a.definition.category === category);
        if (categoryAchievements.length === 0) return null;

        return (
          <div key={category}>
            <h3 className={`text-sm font-medium mb-3 ${CATEGORY_COLORS[category].split(' ')[0]}`}>
              {t(`achievements.categories.${category}`)}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative rounded-lg p-3 border transition-all ${
                    achievement.is_unlocked
                      ? CATEGORY_COLORS[category]
                      : 'bg-slate-800/50 border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`text-2xl ${achievement.is_unlocked ? '' : 'grayscale'}`}>
                      {achievement.definition.icon || '🏆'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium truncate ${
                          achievement.is_unlocked ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.definition.name}
                        </h4>
                        {!achievement.is_unlocked && (
                          <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {achievement.definition.description}
                      </p>
                      
                      {/* Progress */}
                      {!achievement.is_unlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">{t('achievements.progress')}</span>
                            <span className="text-slate-400">
                              {achievement.current_value} / {achievement.definition.requirement_value}
                            </span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            {/* webhint-disable no-inline-styles */}
                            <div
                              className="h-full bg-slate-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (achievement.current_value / achievement.definition.requirement_value) * 100)}%`
                              }}
                            />
                            {/* webhint-enable no-inline-styles */}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className={`flex items-center gap-1 text-sm ${
                      achievement.is_unlocked ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      <Star className="w-3 h-3" />
                      {achievement.definition.points}
                    </div>
                  </div>

                  {/* Unlocked date */}
                  {achievement.is_unlocked && achievement.unlocked_at && (
                    <div className="text-xs text-slate-500 mt-2">
                      {t('achievements.unlockedAt')} {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
