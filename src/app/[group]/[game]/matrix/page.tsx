'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { ClanMatrix } from '@/components/views/ClanMatrix';
import { ShipsView } from '@/components/views/ShipsView';

export default function MatrixPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="matrix"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="matrix" characterCount={characters.length}>
      {gameSlug === 'starcitizen' ? (
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