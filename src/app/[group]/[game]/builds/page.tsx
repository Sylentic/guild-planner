'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { BuildsTab } from '../tabs/BuildsTab';

export default function BuildsPage() {
  const { group, userId } = useGameLayoutContext();

  if (!group || !userId) {
    return null;
  }

  return <BuildsTab groupId={group.id} />;
}