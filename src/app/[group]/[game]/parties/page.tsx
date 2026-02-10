'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { PartiesTab } from '../tabs/PartiesTab';

export default function PartiesPage() {
  const { group, characters, userId, canManageMembers } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return (
    <PartiesTab
      groupId={group.id}
      characters={characters}
      userId={userId}
      canManage={canManageMembers}
    />
  );
}