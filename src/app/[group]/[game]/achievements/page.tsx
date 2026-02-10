'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { AchievementsTab } from '../tabs/AchievementsTab';

export default function AchievementsPage() {
  const { group, userId, canManageMembers } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return <AchievementsTab groupId={group.id} isOfficer={canManageMembers} />;
}