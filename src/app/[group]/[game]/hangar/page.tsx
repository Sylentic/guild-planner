'use client';

import { FleetView } from '@/components/views/FleetView';
import { useGameLayoutContext } from '@/contexts/GameLayoutContext';

export default function FleetPage() {
  const { group, characters, userId, hasPermission } = useGameLayoutContext();

  // Check if user has permission to create ships
  const canManage = hasPermission('ships_create');

  if (!group || !userId) {
    return null;
  }

  return (
    <FleetView
      characters={characters}
      userId={userId}
      canManage={canManage}
      groupId={group.id}
    />
  );
}
