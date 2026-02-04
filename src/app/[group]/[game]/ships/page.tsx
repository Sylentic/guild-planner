'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { ShipsView } from '@/components/views/ShipsView';
import { useGroupData } from '@/hooks/useGroupData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { usePermissions } from '@/hooks/usePermissions';

export default function ShipsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { membership } = useGroupMembership(group?.id || null, user?.id || null);
  const { hasPermission } = usePermissions(group?.id);

  // Check if user can view ships (officers and admins can see all guild ships)
  const canManage = hasPermission('ships_edit_any');

  if (!group || !user) {
    return <GameLayout params={params} activeTab="ships"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="ships">
      <ShipsView
        characters={[]}
        userId={user.id}
        canManage={canManage}
        groupId={group.id}
        gameSlug={gameSlug}
      />
    </GameLayout>
  );
}
