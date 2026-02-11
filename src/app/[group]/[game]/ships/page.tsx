'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { ShipsView } from '@/components/views/ShipsView';

export default function ShipsPage() {
  const { group, userId, hasPermission, gameSlug } = useGameLayoutContext();

  // Check if user can view ships (officers and admins can see all guild ships)
  const canManage = hasPermission('ships_edit_any');

  if (!group || !userId) {
    return null;
  }

  return (
    <ShipsView
      characters={[]}
      userId={userId}
      canManage={canManage}
      groupId={group.id}
      gameSlug={gameSlug}
    />
  );
}
