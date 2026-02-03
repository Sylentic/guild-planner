'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { BuildsTab } from '../tabs/BuildsTab';

export default function BuildsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group } = useGroupData(groupSlug, gameSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="builds"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="builds">
      <BuildsTab groupId={group.id} />
    </GameLayout>
  );
}