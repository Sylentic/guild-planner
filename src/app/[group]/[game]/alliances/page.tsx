'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { AlliancesTab } from '../tabs/AlliancesTab';

export default function AlliancesPage() {
  const { group, userId, canManageMembers } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return <AlliancesTab groupId={group.id} isOfficer={canManageMembers} />;
}