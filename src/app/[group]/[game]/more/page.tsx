'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { MoreTabContent } from '@/components/MoreTabContent';

export default function MorePage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();

  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="more"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="more">
      <MoreTabContent
        groupId={group.id}
        userId={user.id}
        characters={characters}
        isOfficer={canManageMembers}
        gameSlug={gameSlug}
      />
    </GameLayout>
  );
}