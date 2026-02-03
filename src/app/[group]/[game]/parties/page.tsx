'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { PartiesTab } from '../tabs/PartiesTab';

export default function PartiesPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="parties"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="parties">
      <PartiesTab
        groupId={group.id}
        characters={characters}
        userId={user.id}
        canManage={canManageMembers}
      />
    </GameLayout>
  );
}