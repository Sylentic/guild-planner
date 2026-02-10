'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { SiegeTab } from '../tabs/SiegeTab';

export default function SiegePage() {
  const { group, characters, userId } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return <SiegeTab groupId={group.id} characters={characters} userId={userId} />;
}