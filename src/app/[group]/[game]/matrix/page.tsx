'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { ClanMatrix } from '@/components/ClanMatrix';
import { ShipsView } from '@/components/ShipsView';

export default function MatrixPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="matrix"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="matrix">
      {gameSlug === 'star-citizen' ? (
        <ShipsView
          characters={characters}
          userId={user.id}
          canManage={canManageMembers}
          groupId={group.id}
          gameSlug={gameSlug}
        />
      ) : (
        <ClanMatrix members={characters} />
      )}
    </GameLayout>
  );
}