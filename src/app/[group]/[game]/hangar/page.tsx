'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { FleetView } from '@/components/views/FleetView';
import { useGroupData } from '@/hooks/useGroupData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { usePermissions } from '@/hooks/usePermissions';

export default function FleetPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { membership } = useGroupMembership(group?.id || null, user?.id || null);
  const { hasPermission } = usePermissions(group?.id);

  // Check if user has permission to create ships (add ships to their own characters)
  const canManage = hasPermission('ships_create');

  if (!group || !user) {
    return <GameLayout params={params} activeTab="matrix"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="fleet" characterCount={characters.length}>
      <FleetView
        characters={characters}
        userId={user.id}
        canManage={canManage}
        groupId={group.id}
      />
    </GameLayout>
  );
}
