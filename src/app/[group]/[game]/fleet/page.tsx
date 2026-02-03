'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { FleetView } from '@/components/FleetView';
import { useGroupData } from '@/hooks/useGroupData';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupMembership } from '@/hooks/useGroupMembership';

export default function FleetPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { membership } = useGroupMembership(group?.id || null, user?.id || null);

  const canManage = membership?.role === 'admin' || membership?.role === 'officer';

  if (!group || !user) {
    return <GameLayout params={params} activeTab="matrix"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="fleet">
      <FleetView
        characters={characters}
        userId={user.id}
        canManage={canManage}
        groupId={group.id}
      />
    </GameLayout>
  );
}
