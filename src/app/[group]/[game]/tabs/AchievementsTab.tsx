import { useAchievements } from '@/hooks/useAchievements';
import { AchievementsView } from '@/components/views/AchievementsView';
import { AchievementAdminPanel } from '@/components/views/AchievementAdminPanel';

export interface AchievementsTabProps {
  groupId: string;
  isOfficer: boolean;
}

export function AchievementsTab({ groupId, isOfficer }: AchievementsTabProps) {
  const {
    achievements,
    unlockedCount,
    totalPoints,
    loading: achievementsLoading,
    refresh: refreshAchievements,
  } = useAchievements(groupId);

  if (achievementsLoading) {
    return <div className="text-center py-8 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {isOfficer && (
        <AchievementAdminPanel
          achievements={achievements}
          groupId={groupId}
          onRefresh={refreshAchievements}
        />
      )}
      <AchievementsView
        achievements={achievements}
        unlockedCount={unlockedCount}
        totalPoints={totalPoints}
      />
    </div>
  );
}

