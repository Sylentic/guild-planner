'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { ClanMatrix } from '@/components/views/ClanMatrix';
import { ShipsView } from '@/components/views/ShipsView';

export default function MatrixPage() {
  const { group, characters, userId, canManageMembers, gameSlug } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return gameSlug === 'starcitizen' ? (
    <ShipsView
      characters={characters}
      userId={userId}
      canManage={canManageMembers}
      groupId={group.id}
      gameSlug={gameSlug}
    />
  ) : (
    <ClanMatrix members={characters} />
  );
}