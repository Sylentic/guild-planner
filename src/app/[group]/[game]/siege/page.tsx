'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { SiegeTab } from '../tabs/SiegeTab';

export default function SiegePage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="siege"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="siege" characterCount={characters.length}>
      <SiegeTab groupId={group.id} characters={characters} userId={user.id} />
    </GameLayout>
  );
}