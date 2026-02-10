'use client';

import { use } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { EconomyTab } from '../tabs/EconomyTab';

export default function EconomyPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  if (!group || !user) {
    return null;
  }

  return <EconomyTab groupId={group.id} isOfficer={canManageMembers} />;
}