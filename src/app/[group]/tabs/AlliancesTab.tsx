"use client";

import { useAlliances } from '@/hooks/useAlliances';
import { AllianceView } from '@/components/AllianceView';

export interface AlliancesTabProps {
  groupId: string;
  isOfficer: boolean;
}

export function AlliancesTab({ groupId, isOfficer }: AlliancesTabProps) {
  const {
    myAlliance,
    createAlliance,
    inviteGuild,
    leaveAlliance,
    loading,
    error,
  } = useAlliances(groupId);

  if (loading) return <div className="text-slate-400">Loading alliances...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <AllianceView
      alliance={myAlliance}
      groupId={groupId}
      onCreateAlliance={createAlliance}
      onInviteGuild={inviteGuild}
      onLeave={leaveAlliance}
      isOfficer={isOfficer}
    />
  );
}

