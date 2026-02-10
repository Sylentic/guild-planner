'use client';

import { use } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { SiegeTab } from '../tabs/SiegeTab';

export default function SiegePage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);

  if (!group || !user) {
    return null;
  }

  return <SiegeTab groupId={group.id} characters={characters} userId={user.id} />;
}