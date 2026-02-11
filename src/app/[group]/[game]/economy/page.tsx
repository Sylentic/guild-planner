'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { EconomyTab } from '../tabs/EconomyTab';

export default function EconomyPage() {
  const { group, userId, canManageMembers } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return <EconomyTab groupId={group.id} isOfficer={canManageMembers} />;
}