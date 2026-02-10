'use client';

import { use } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { BuildsTab } from '../tabs/BuildsTab';

export default function BuildsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);

  if (!group || !user) {
    return null;
  }

  return <BuildsTab groupId={group.id} />;
}